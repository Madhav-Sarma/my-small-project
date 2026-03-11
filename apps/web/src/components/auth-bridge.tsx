import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { setAuthTokenGetter, api } from "../lib/api";
import { useAppStore } from "../store/app-store";

/**
 * Bridges Clerk authentication with the API client.
 * Place this inside ClerkProvider + SignedIn so `useAuth` works.
 * Also triggers user provisioning on first login.
 */
export function AuthBridge() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const bootstrapped = useRef(false);
  const setUserProfile = useAppStore((s) => s.setUserProfile);

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && !bootstrapped.current) {
      bootstrapped.current = true;
      api.users.bootstrap({
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName ?? user?.firstName ?? undefined,
        avatarUrl: user?.imageUrl,
      }).then((res) => {
        setUserProfile({
          id: res.data.id,
          organizationId: res.data.organizationId,
          workspaceId: res.data.workspaceId,
          email: user?.primaryEmailAddress?.emailAddress ?? null,
          name: user?.fullName ?? user?.firstName ?? null,
          avatarUrl: user?.imageUrl ?? null,
        });
      }).catch(() => {});
    }
  }, [isSignedIn, user, setUserProfile]);

  return null;
}
