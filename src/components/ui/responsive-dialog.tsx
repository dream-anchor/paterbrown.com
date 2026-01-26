import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive Dialog/Drawer component
 * - Desktop: Renders as a centered Dialog
 * - Mobile: Renders as a bottom Drawer with swipe-to-close
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  children,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn("max-h-[90vh]", className)}>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogHeader({ children, className }: ResponsiveDialogHeaderProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerHeader : DialogHeader;
  return <Comp className={className}>{children}</Comp>;
}

interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogTitle({ children, className }: ResponsiveDialogTitleProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerTitle : DialogTitle;
  return <Comp className={cn("text-gray-900", className)}>{children}</Comp>;
}

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogDescription({ children, className }: ResponsiveDialogDescriptionProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerDescription : DialogDescription;
  return <Comp className={className}>{children}</Comp>;
}

interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogFooter({ children, className }: ResponsiveDialogFooterProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerFooter : DialogFooter;
  return <Comp className={className}>{children}</Comp>;
}

interface ResponsiveDialogCloseProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function ResponsiveDialogClose({ children, className, asChild }: ResponsiveDialogCloseProps) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerClose : DialogClose;
  return <Comp className={className} asChild={asChild}>{children}</Comp>;
}

/**
 * Body wrapper with proper scrolling for long content
 */
interface ResponsiveDialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogBody({ children, className }: ResponsiveDialogBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-4 py-2", className)}>
      {children}
    </div>
  );
}
