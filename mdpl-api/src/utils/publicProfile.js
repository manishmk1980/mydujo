function optionalText(value, maxLength, fieldName) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > maxLength) {
    const error = new Error(`${fieldName} must be ${maxLength} characters or fewer`);
    error.status = 400;
    throw error;
  }
  return text;
}

function optionalInteger(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 1000000) {
    const error = new Error("publicDisplayOrder must be a whole number between 0 and 1000000");
    error.status = 400;
    throw error;
  }
  return parsed;
}

function normalizePhotoUrl(value) {
  const photoUrl = optionalText(value, 512, "publicPhotoUrl");
  if (!photoUrl) return null;

  let pathname = photoUrl;
  if (/^https?:\/\//i.test(photoUrl)) {
    let parsed;
    try {
      parsed = new URL(photoUrl);
    } catch {
      const error = new Error("publicPhotoUrl is invalid");
      error.status = 400;
      throw error;
    }
    const configuredHosts = String(process.env.PUBLIC_ASSET_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    try {
      if (process.env.API_BASE_URL) {
        configuredHosts.push(new URL(process.env.API_BASE_URL).hostname.toLowerCase());
      }
    } catch {
      // Invalid API_BASE_URL is handled by environment validation elsewhere.
    }
    if (!configuredHosts.includes(parsed.hostname.toLowerCase())) {
      const error = new Error("publicPhotoUrl host is not allowed");
      error.status = 400;
      throw error;
    }
    pathname = parsed.pathname;
  }

  if (!["/uploads/", "/api/uploads/", "/assets/", "/brand/"].some((prefix) => pathname.startsWith(prefix))) {
    const error = new Error("publicPhotoUrl must use an approved uploaded asset path");
    error.status = 400;
    throw error;
  }
  return photoUrl;
}

export function parsePublicProfilePayload(body = {}) {
  return {
    publicProfileEnabled: body.publicProfileEnabled === true,
    publicDisplayOrder: optionalInteger(body.publicDisplayOrder),
    isFeaturedPublic: body.isFeaturedPublic === true,
  };
}

export function parseInstructorOwnedPublicProfile(body = {}) {
  return {
    publicDisplayName: optionalText(body.publicDisplayName, 255, "publicDisplayName"),
    publicBio: optionalText(body.publicBio, 1000, "publicBio"),
    publicPhotoUrl: normalizePhotoUrl(body.publicPhotoUrl),
    publicDiscipline: optionalText(body.publicDiscipline, 128, "publicDiscipline"),
    publicConsentConfirmed: body.publicConsentConfirmed === true,
  };
}

export function publicProfileErrorResponse(error, fallback) {
  if (error?.code === "P2002") {
    return { status: 409, message: "That public URL slug is already in use" };
  }
  return {
    status: Number(error?.status) || 500,
    message: Number(error?.status) ? error.message : fallback,
  };
}
