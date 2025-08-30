// "use client";

// import Image from "next/image";
// import { useState, useRef } from "react";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../ui/dialog";
// import ClientSearchInput from "../../app/[locale]/search/components/ClientSearchInput";
// import type {
//   Category,
//   Product,
//   ProductVariant,
//   ProductImage,
// } from "@prisma/client";

// // Extended types with relations
// type ProductWithRelations = Product & {
//   variants: (ProductVariant & {
//     images: ProductImage[];
//   })[];
//   category: Category | null;
// };

// export default function SearchBar({
//   initialData,
// }: {
//   initialData: { products: ProductWithRelations[]; categories: Category[] };
// }) {
//   const closeButtonRef = useRef<HTMLButtonElement>(null);
//   const [searchData] = useState(initialData);

//   const [searchQuery, setSearchQuery] = useState("");

//   return (
//     <div className="relative group h-full flex items-center">
//       <Dialog>
//         <DialogTrigger asChild>
//           <button
//             type="button"
//             className="cursor-pointer hover:opacity-70 transition-opacity"
//             aria-label="Open search"
//           >
//             <Image
//               src={"/assets/172546_search_icon.svg"}
//               alt="Search-icon"
//               width={20}
//               height={20}
//               className="hover:text-gray-700 hoverEffect"
//             />
//           </button>
//         </DialogTrigger>
//         <DialogContent
//           showCloseButton={false}
//           className="fixed top-0 mt-10 max-w-screen w-screen rounded-none shadow-none z-50 border-b bg-white xl:px-70"
//         >
//           <DialogHeader>
//             <DialogTitle className="sr-only">Search Products</DialogTitle>
//           </DialogHeader>
//           <div className="flex items-center justify-center">
//             <ClientSearchInput
//               products={searchData.products}
//               categories={searchData.categories}
//               onSearch={setSearchQuery}
//               searchQuery={searchQuery}
//             />
//             <DialogClose asChild>
//               <button
//                 type="button"
//                 className="p-0 bg-transparent border-0 cursor-pointer ml-4"
//                 ref={closeButtonRef}
//                 aria-label="Close search"
//               >
//                 <Image
//                   src={"/assets/close.svg"}
//                   alt="Close"
//                   width={30}
//                   height={30}
//                   className="hover:text-gray-700 hoverEffect"
//                 />
//               </button>
//             </DialogClose>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
