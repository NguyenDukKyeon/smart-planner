import type { ComponentProps } from "react";
import { NotificationCenterModal } from "./NotificationCenterModal";

type PushNotificationCenterModalProps = ComponentProps<typeof NotificationCenterModal>;

export function PushNotificationCenterModal({
  onOpenChange,
  onStartFocus,
  ...props
}: PushNotificationCenterModalProps) {
  const handleStartFocus: NonNullable<PushNotificationCenterModalProps["onStartFocus"]> = (
    ...args
  ) => {
    onOpenChange(false);
    onStartFocus?.(...args);
  };

  return (
    <NotificationCenterModal
      {...props}
      onOpenChange={onOpenChange}
      onStartFocus={handleStartFocus}
    />
  );
}

export { NotificationCenterModal };
