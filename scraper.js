// ==============================
// TikTok Profile Scraper - Standalone Version
// Bisa dipakai di Node.js (disarankan)
// ==============================

import fetch from "node-fetch";

export async function scrapeTikTokProfile(input) {
  try {
    // 1. Build URL
    let url = "";
    if (input.includes("tiktok.com")) {
      url = input;
    } else {
      const cleanUsername = input.replace("@", "");
      url = `https://www.tiktok.com/@${cleanUsername}`;
    }

    console.log(`[Scraper] Fetching: ${url}`);

    // 2. Fetch HTML dari TikTok
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    // 3. Handle errors
    if (!response.ok) {
      if (response.status === 404) throw new Error("Account not found");
      if (response.status === 403) throw new Error("Access denied (private/blocked)");
      if (response.status === 429) throw new Error("Too many requests");
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // 4. Parse data pakai REGEX (TikTok embed JSON data di <script> tag)
    const followersMatch = html.match(/"followerCount":(\d+)/);
    const followingMatch = html.match(/"followingCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const videosMatch = html.match(/"videoCount":(\d+)/);
    const nicknameMatch = html.match(/"nickname":"([^"]+)"/);
    const usernameMatch =
      html.match(/"uniqueId":"([^"]+)"/) || html.match(/@([a-zA-Z0-9_.]+)/);

    // Bio/Description
    const bioMatch = html.match(/"signature":"([^"]+)"/);
    const bio = bioMatch
      ? bioMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\u[\dA-F]{4}/gi, "")
      : null;

    // Avatar URL
    const avatarMatch = html.match(/"avatarLarger":"([^"]+)"/);
    const avatarUrl = avatarMatch
      ? avatarMatch[1].replace(/\\u002F/g, "/")
      : null;

    // Verified status
    const verifiedMatch = html.match(/"verified":(true|false)/);
    const isVerified = verifiedMatch ? verifiedMatch[1] === "true" : false;

    // External links (Instagram, YouTube, Twitter)
    const externalLinks = [];

    const instagramMatch = html.match(/"instagram":"([^"]+)"/);
    if (instagramMatch && instagramMatch[1]) {
      externalLinks.push({
        platform: "Instagram",
        url: `https://instagram.com/${instagramMatch[1]}`,
      });
    }

    const youtubeMatch = html.match(/"youtube":"([^"]+)"/);
    if (youtubeMatch && youtubeMatch[1]) {
      externalLinks.push({
        platform: "YouTube",
        url: `https://youtube.com/${youtubeMatch[1]}`,
      });
    }

    const twitterMatch = html.match(/"twitter":"([^"]+)"/);
    if (twitterMatch && twitterMatch[1]) {
      externalLinks.push({
        platform: "Twitter",
        url: `https://twitter.com/${twitterMatch[1]}`,
      });
    }

    const bioLinkMatch = html.match(/"bioLink":\{"link":"([^"]+)"/);
    if (bioLinkMatch && bioLinkMatch[1]) {
      externalLinks.push({
        platform: "Website",
        url: bioLinkMatch[1],
      });
    }

    // 5. Extract username
    const extractedUsername = usernameMatch
      ? usernameMatch[1]
      : input.replace("@", "").split("/").pop() || "unknown";

    // 6. Validate data
    if (!followersMatch && !likesMatch && !videosMatch) {
      throw new Error("Could not extract data (private/blocked account)");
    }

    // 7. Build result object
    const profile = {
      username: extractedUsername,
      nickname: nicknameMatch ? nicknameMatch[1] : "Unknown User",
      bio: bio,
      avatarUrl: avatarUrl,
      isVerified: isVerified,
      followers: followersMatch ? parseInt(followersMatch[1]) : 0,
      following: followingMatch ? parseInt(followingMatch[1]) : 0,
      likes: likesMatch ? parseInt(likesMatch[1]) : 0,
      videos: videosMatch ? parseInt(videosMatch[1]) : 0,
      externalLinks: externalLinks.length > 0 ? externalLinks : null,
    };

    console.log(`✅ Scraped @${profile.username}`);
    console.log(`   ${profile.followers.toLocaleString()} followers`);
    console.log(`   ${profile.videos.toLocaleString()} videos`);
    console.log(`   ${profile.likes.toLocaleString()} likes`);
    console.log(`   Verified: ${profile.isVerified ? "Yes" : "No"}`);

    return profile;
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
}
