/**
 * Jitsi Meet utilities — room name generation, link building, config.
 *
 * Room names are deterministic: based on the appointment ID so
 * both admin and patient always resolve to the same room.
 */

const JITSI_DOMAIN = "meet.jit.si";
const ROOM_PREFIX = "psicolobia";

/** Build a deterministic room name from an appointment ID */
export function buildRoomName(appointmentId: string): string {
  // Use first 12 chars of uuid to keep the URL short but unique
  const short = appointmentId.replace(/-/g, "").slice(0, 12);
  return `${ROOM_PREFIX}-${short}`;
}

/** Full Jitsi meeting URL for a given appointment */
export function buildMeetingUrl(appointmentId: string): string {
  return `https://${JITSI_DOMAIN}/${buildRoomName(appointmentId)}`;
}

/** Config overrides for the Jitsi External API iframe */
export const jitsiConfig = {
  startWithAudioMuted: true,
  startWithVideoMuted: false,
  prejoinPageEnabled: false,
  disableDeepLinking: true,
  enableWelcomePage: false,
  enableClosePage: false,
  disableModeratorIndicator: true,
  disableReactions: true,
  hiddenPremeetingButtons: ["invite"] as string[],
};

export const jitsiInterfaceConfig = {
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  TOOLBAR_BUTTONS: [
    "microphone",
    "camera",
    "desktop",
    "chat",
    "raisehand",
    "tileview",
    "hangup",
  ],
  DISABLE_VIDEO_BACKGROUND: true,
  DEFAULT_BACKGROUND: "#FFF5EE",
};

export { JITSI_DOMAIN };
