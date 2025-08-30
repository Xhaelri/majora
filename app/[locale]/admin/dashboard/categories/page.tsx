import React from "react";
import CreateCategoryForm from "./CreateCategoryForm";
import CategoriesList from "./CategoriesList";

const page = () => {
  return (
    <div>
      <CreateCategoryForm />
      <CategoriesList />
    </div>
  );
};

export default page;


