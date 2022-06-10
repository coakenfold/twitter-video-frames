import type { Album, Playlist, CurrentlyPlaying } from "spotify-types";

export const PLATFORM_API = "https://api.spotify.com/v1";

export interface CurrentlyPlayingOutput extends CurrentlyPlaying {
  error?: { status: number };
}
export const currentlyPlaying = async (
  accessToken: string
): Promise<CurrentlyPlayingOutput | null> => {
  /*
  NOTE: Required `scopes`:
    user-read-currently-playing
  */
  const output = await fetch(`${PLATFORM_API}/me/player/currently-playing`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    if (response.status === 204) {
      return null;
    }
    return response.json();
  });
  console.log(
    `${PLATFORM_API}/me/player/currently-playing`,
    JSON.stringify(output)
  );
  return output;
};

export interface PlaylistCreateInput {
  accessToken: string;
  description: string;
  name: string;
  userId: string;
}
export const playlistCreate = async ({
  accessToken,
  description,
  name,
  userId,
}: PlaylistCreateInput): Promise<Playlist> => {
  /*
  NOTE: Required `scopes`:
    playlist-read-private
    playlist-read-collaborative
  */
  const output = await fetch(`${PLATFORM_API}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
      description,
    }),
  }).then((response) => response.json());
  console.log(
    `${PLATFORM_API}/users/${userId}/playlists`,
    JSON.stringify(output)
  );
  return output;
};

export interface PlaylistAddInput {
  accessToken: string;
  playlistId: string;
  uris: string[];
}
export const playlistAdd = async ({
  accessToken,
  playlistId,
  uris,
}: PlaylistAddInput): Promise<Playlist> => {
  /*
  NOTE: Required `scopes`:
    playlist-modify-public
    playlist-modify-private
  */
  const output = await fetch(`${PLATFORM_API}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      uris,
    }),
  }).then((response) => response.json());
  console.log(
    `${PLATFORM_API}/playlists/${playlistId}/tracks`,
    JSON.stringify(output)
  );
  return output;
};

export interface AlbumGetInput {
  accessToken: string;
  albumId: string;
}
export const albumGet = async ({
  accessToken,
  albumId,
}: AlbumGetInput): Promise<Album> => {
  /* 
    NOTE: No `scopes` required
  */
  const output = await fetch(`${PLATFORM_API}/albums/${albumId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => response.json());
  console.log(`${PLATFORM_API}/albums/${albumId}`, JSON.stringify(output));
  return output;
};
