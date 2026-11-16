export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const requestId = req.query.requestId;
    const apiKey = process.env.FAL_KEY;

    if (!requestId) {
      return res.status(400).json({
        error: "Missing video request ID."
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "Video service is not configured."
      });
    }

    const model = "fal-ai/wan/v2.7/text-to-video";

    const statusResponse = await fetch(
      `https://queue.fal.run/${model}/requests/${encodeURIComponent(requestId)}/status`,
      {
        headers: {
          Authorization: `Key ${apiKey}`
        }
      }
    );

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return res.status(statusResponse.status).json({
        error: "Could not check video status."
      });
    }

    if (statusData.status !== "COMPLETED") {
      return res.status(200).json({
        status: statusData.status,
        message: "Your video is still generating."
      });
    }

    if (statusData.error) {
      return res.status(500).json({
        status: "FAILED",
        error: statusData.error
      });
    }

    const resultResponse = await fetch(
      `https://queue.fal.run/${model}/requests/${encodeURIComponent(requestId)}`,
      {
        headers: {
          Authorization: `Key ${apiKey}`
        }
      }
    );

    const resultData = await resultResponse.json();

    if (!resultResponse.ok || !resultData.video?.url) {
      return res.status(500).json({
        error: "Could not retrieve the finished video."
      });
    }

    return res.status(200).json({
      status: "COMPLETED",
      videoUrl: resultData.video.url
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong while checking your video."
    });
  }
      }
