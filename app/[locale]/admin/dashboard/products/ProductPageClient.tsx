"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductsList from "./ProductsList";
import CreateProductForm from "./CreateProductForm";
import ReusableDialog from "@/components/ui-custom/ReusableDialog";
import { Category } from "@prisma/client";

// Define the category type that matches your server action return

interface Props {
  categories: Category[];
}

export default function ProductsPageClient({ categories }: Props) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleProductCreated = () => {
    setCreateDialogOpen(false);
    // The ProductsList component will automatically refresh via its onProductUpdated callback
  };

  return (
    <section className="flex flex-col w-full">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create New Product
        </Button>
      </header>

      <div className="p-6">
        <ProductsList />
      </div>

      {/* Create Product Dialog */}
      <ReusableDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create New Product"
        description="Add a new product to your inventory."
      >
        <CreateProductForm
          categories={categories}
          onSuccess={handleProductCreated}
        />
      </ReusableDialog>
    </section>
  );
}