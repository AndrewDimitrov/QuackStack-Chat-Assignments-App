import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";

export async function POST(request) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { githubUrl, assignmentTitle, assignmentDescription, points } =
    await request.json();

  // Extract owner/repo from GitHub URL
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match)
    return Response.json({ error: "Invalid GitHub URL" }, { status: 400 });

  const [, owner, repo] = match;

  // Get file tree from GitHub API
  let fileTree = [];
  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      {
        headers: { "User-Agent": "DevSpace-App" },
      },
    );
    const treeData = await treeRes.json();
    fileTree = (treeData.tree || [])
      .filter((f) => f.type === "blob")
      .map((f) => f.path)
      .slice(0, 150); // лимит
  } catch (e) {
    fileTree = [];
  }

  // Build prompt
  const prompt = `You are a coding instructor evaluating a student project submission.

Assignment: "${assignmentTitle}"
${assignmentDescription ? `Description: ${assignmentDescription}` : ""}
Maximum points: ${points}

The student submitted a GitHub repository with these files:
${fileTree.length > 0 ? fileTree.join("\n") : "No files found or private repository"}

Based on:
1. The complexity expected for ${points} points
2. The file structure and what functionality appears to be implemented
3. Whether the project structure matches the assignment requirements

Provide:
- A suggested points score (0 to ${points})
- A brief 2-3 sentence explanation of your assessment
- One specific positive observation
- One suggestion for improvement (if any)

Respond in JSON format only:
{
  "suggestedPoints": <number between 0 and ${points}>,
  "summary": "<2-3 sentences>",
  "positive": "<observation>",
  "suggestion": "<improvement or null>"
}`;

  // Call Gemini API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    },
  );

  const geminiData = await geminiRes.json();
  console.log("Gemini response:", JSON.stringify(geminiData));
  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("text:", text);

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "Failed to parse AI response" },
      { status: 500 },
    );
  }
}
