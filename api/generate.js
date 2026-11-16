export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, style, format } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please describe your video."
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        error: "Your description is too long."
      });
    }

    const apiKey = process.env.FAL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Video service is not configured."
      });
    }

    const videoStyle =
      style === "Animation / Cartoon"
        ? "Create a high-quality animated cartoon video. "
        : "Create a realistic cinematic human video. ";

    const response = await fetch(
      "https://queue.fal.run/fal-ai/wan/v2.7/text-to-video",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: videoStyle + prompt,
          aspect_ratio: format || "9:16",
          resolution: "720p",
          duration: 5,
          enable_prompt_expansion: true,
          enable_safety_checker: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || "Video generation request failed."
      });
    }

    return res.status(200).json({
      message: "Video generation started.",
      requestId: data.request_id,
      statusUrl: data.status_url,
      resultUrl: data.response_url
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
}
