import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export async function POST(request) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file)
    return Response.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "chat-images" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });
    return Response.json({ url: result.secure_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
