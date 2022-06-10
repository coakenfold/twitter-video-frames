import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Session } from "remix-auth-twitter";
import { authentication } from "~/models/auth.server";

import type { SimplifiedTrack, CurrentlyPlaying } from "spotify-types";

import {
  currentlyPlaying,
  playlistCreate,
  playlistAdd,
  albumGet,
} from "~/service/platform.api.server";

export interface LoaderOutput {
  session: Session;
  current?: CurrentlyPlaying;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);
  let current = {};
  if (session?.user) {
    current = (await currentlyPlaying(session.accessToken)) || {};
  }
  return {
    session,
    current,
  };
};

export interface CreateAlbumPlaylistFromCurrentTrackInput {
  accessToken: string;
  userId: string;
  userName: string;
  trackTitle: string;
  albumId: string;
  albumTitle: string;
}

const createAlbumPlaylistFromCurrentTrack = async ({
  accessToken,
  userId,
  userName,
  trackTitle,
  albumId,
  albumTitle,
}: CreateAlbumPlaylistFromCurrentTrackInput) => {
  let playlist = null;

  const albumData = await albumGet({
    accessToken,
    albumId,
  });
  const albumArtists = albumData?.artists
    ? albumData?.artists.map(({ name }) => name).join(", ")
    : undefined;

  const albumTracks = albumData.tracks as unknown as Record<string, unknown>;
  const albumTrackItems = albumTracks?.items as SimplifiedTrack[];

  if (albumTrackItems) {
    playlist = await playlistCreate({
      accessToken,
      description: `👋 This playlist was created for "${userName}" while "${trackTitle}" was playing — TVF`,
      name: `🎧 ${albumTitle} - ${albumArtists}`,
      userId,
    });

    if (playlist.id) {
      const playlistUpdated = await playlistAdd({
        accessToken,
        playlistId: playlist.id,
        uris: albumTrackItems.map(({ uri }) => uri),
      });
      if (playlistUpdated.snapshot_id) {
        return {
          success: true,
          playlistId: playlist.id,
        };
      }
    }
  }

  return {
    success: false,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const { platformStrategy } = await authentication(request);
  const session = await platformStrategy.getSession(request);
  if (session) {
    const form = await request.formData();
    const accessToken = session.accessToken;

    const userId = form.get("userId") as string | undefined;
    const userName = form.get("userName") as string | undefined;
    const trackTitle = form.get("trackTitle") as string | undefined;
    const albumId = form.get("albumId") as string | undefined;
    const albumTitle = form.get("albumTitle") as string | undefined;
    if (
      accessToken &&
      userId &&
      userName &&
      trackTitle &&
      albumId &&
      albumTitle
    ) {
      const output = await createAlbumPlaylistFromCurrentTrack({
        accessToken,
        userId,
        userName,
        trackTitle,
        albumId,
        albumTitle,
      });

      const urlParam = output?.success
        ? `?playlistId=${output.playlistId}`
        : "";
      return redirect(`/tvf${urlParam}`);
    }
  }
};
export default function Create() {
  return (
    <main className="mx-16 my-16">
      <h1 className="font-light text-slate-900 dark:text-slate-50">Create</h1>
    </main>
  );
}
