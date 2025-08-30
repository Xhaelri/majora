import React from "react";
import VariantsList from "./VariantsList";
// import EditVariantForm from "./EditVariantForm";
import VariantPageLayoutClient from "./VariantPageLayoutClient";

const page = () => {
  return (
    <div>
      <VariantPageLayoutClient>
        <VariantsList />
      </VariantPageLayoutClient>
      {/* <EditVariantForm /> */}
    </div>
  );
};

export default page;
