import { Hono } from "hono";
import { s3Client } from "@/lib/r2Client";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";

const app = new Hono();

app.post("/avatar", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  // 2. Parse Form Data
  const formData = await c.req.formData();
  const file = formData.get("avatar") as File;

  if (!file) return c.json({ error: "No file provided" }, 400);

  // 3. Validation (Optional but recommended)
  // Check file type (e.g., allow only images) and size
  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    // 5MB limit
    return c.json({ error: "File size exceeds 5MB" }, 400);
  }

  // 4. Prepare File Info
  const timestamp = Date.now();
  // Sanitize filename to prevent issues with special characters in URLs
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `avatars/${session.user.id}-${timestamp}-${safeName}`;

  // 5. Convert to ArrayBuffer for maximum compatibility with AWS SDK v3
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: file.type,
    // If you are not using a public bucket policy, you might need ACL: 'public-read'
    // ACL: 'public-read',
  });

  try {
    // 6. Upload to R2
    await s3Client.send(command);

    // 7. Construct Public URL
    // CRITICAL FIX: Use the public domain, NOT the S3 endpoint.
    // Ensure R2_PUBLIC_DOMAIN is set in .env (e.g., https://pub-xxxx.r2.dev)
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!publicDomain) {
      console.error("Missing R2_PUBLIC_DOMAIN environment variable");
      return c.json({ error: "Server misconfiguration" }, 500);
    }

    const oldFile = session.user.image;
    const fileUrl = `${publicDomain}/${fileName}`;

    // 8. Update User Profile
    await auth.api.updateUser({
      headers: c.req.raw.headers,
      body: {
        image: fileUrl,
      },
    });

    if (oldFile) {
      try {
        const oldKey = oldFile.replace(`${publicDomain}/`, "");

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: oldKey,
          }),
        );

        console.log("Old avatar removed:", oldKey);
      } catch (err) {
        console.error("Failed to delete old avatar:", err);
        // Don't return error; it's non-critical
      }
    }

    return c.json({
      message: "File uploaded successfully",
      url: fileUrl,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

export default app;
