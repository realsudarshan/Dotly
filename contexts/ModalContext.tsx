// contexts/ModalContext.tsx
import { AlertTriangle, Info } from "@tamagui/lucide-icons";
import React, { createContext, useContext, useState } from "react";
import { AlertDialog, Button, Dialog, XStack, YStack } from "tamagui";

type ModalType = "dialog" | "alert";

interface ModalConfig {
  type: ModalType;
  title: string;
  description?: string;
  content?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextValue {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [open, setOpen] = useState(false);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
    setTimeout(() => setModalConfig(null), 300); // Wait for animation
  };

  const handleConfirm = async () => {
    if (modalConfig?.onConfirm) {
      await modalConfig.onConfirm();
    }
    hideModal();
  };

  const handleCancel = () => {
    modalConfig?.onCancel?.();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}

      {/* Dialog Modal */}
      {modalConfig?.type === "dialog" && (
        <Dialog modal open={open} onOpenChange={setOpen}>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            onPress={hideModal}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animateOnly={["transform", "opacity"]}
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
          >
            <YStack gap="$3" style={{ alignItems: "center" }}>
              <Info size={48} color="$blue10" />
              <Dialog.Title style={{ textAlign: "center" }}>
                {modalConfig.title}
              </Dialog.Title>
            </YStack>
            {modalConfig.description && (
              <Dialog.Description style={{ textAlign: "center" }}>
                {modalConfig.description}
              </Dialog.Description>
            )}
            {modalConfig.content}
            <XStack pb="$4" gap="$3" style={{ justifyContent: "center" }}>
              <Dialog.Close displayWhenAdapted asChild>
                <Button onPress={handleCancel} flex={1}>
                  {modalConfig.cancelText || "Cancel"}
                </Button>
              </Dialog.Close>

              {modalConfig.onConfirm && (
                <Dialog.Close displayWhenAdapted asChild>
                  <Button onPress={handleConfirm} flex={1}>
                    {modalConfig.confirmText || "Confirm"}
                  </Button>
                </Dialog.Close>
              )}
            </XStack>
          </Dialog.Content>
        </Dialog>
      )}

      {/* Alert Dialog */}
      {modalConfig?.type === "alert" && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialog.Overlay
            key="overlay"
            opacity={0.5}
            onPress={hideModal}
            animation="lazy"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
          >
            <YStack gap="$3" style={{ alignItems: "center" }}>
              <AlertTriangle size={48} color="$red10" />
              <AlertDialog.Title style={{ textAlign: "center" }}>
                {modalConfig.title}
              </AlertDialog.Title>
            </YStack>
            {modalConfig.description && (
              <AlertDialog.Description style={{ textAlign: "center" }}>
                {modalConfig.description}
              </AlertDialog.Description>
            )}
            <XStack pb="$4" gap="$3" style={{ justifyContent: "center" }}>
              <AlertDialog.Cancel asChild>
                <Button onPress={handleCancel} flex={1}>
                  {modalConfig.cancelText || "Cancel"}
                </Button>
              </AlertDialog.Cancel>

              {modalConfig.onConfirm && (
                <AlertDialog.Action asChild>
                  <Button onPress={handleConfirm} flex={1}>
                    {modalConfig.confirmText || "Confirm"}
                  </Button>
                </AlertDialog.Action>
              )}
            </XStack>
          </AlertDialog.Content>
        </AlertDialog>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};