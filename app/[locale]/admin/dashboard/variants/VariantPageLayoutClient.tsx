"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateVariantForm from "./CreateVariantForm";

type Props = {
  children: React.ReactNode;
};

export default function VariantPageLayoutClient({
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <header className="flex items-center justify-end p-4">
        <Button onClick={() => setOpen(true)}>Create New Variant</Button>
      </header>

      <main className="p-6">{children}</main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[600px] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Fill in the product details below.
            </DialogDescription>
          </DialogHeader>
          <CreateVariantForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
