// components/SearchInput.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "../Link/Link";

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  variants: {
    id: string;
    images: {
      url: string;
      altText: string;
    }[];
  }[];
};

type SearchCategory = {
  id: string;
  name: string;
};

type SearchResults = {
  products: SearchProduct[];
  categories: SearchCategory[];
};

export default function SearchInput({
  isSearchPage,
  onSearchComplete
}: {
  isSearchPage: boolean;
  onSearchComplete?: () => void;
}) {
  const inputRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
  });
  const router = useRouter();

  //useCallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 0) {
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => setResults(data));
      } else {
        setResults({ products: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false)
      onSearchComplete?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isSearchPage ? (
        <div ref={inputRef} className="relative w-full max-w-4xl ">
          <div className="flex w-full">
            <div className="relative z-20 w-full">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full p-2 border focus:outline-black focus:outline-1 relative"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                />
                <Image
                  src={"/assets/172546_search_icon.svg"}
                  alt="Search-icon"
                  width={40}
                  height={10}
                  className=" hover:text-gray-700 hoverEffect absolute right-0 top-1 px-2 py-1"
                  onClick={handleSubmit}
                />
              </form>
            </div>
            {isOpen && (
              <Image
                src={"/assets/close.svg"}
                alt="Search-icon"
                width={30}
                height={10}
                className=" hover:text-gray-700 hoverEffect"
                onClick={() => {
                  setIsOpen(false);
                }}
              />
            )}
          </div>

          {isOpen &&
          (results.products.length > 0 || results.categories.length > 0) ? (
            <div className="absolute left-0 z-10 bg-white shadow-2xl backdrop-brightness-125 w-full md:w-full p-6  flex flex-col lg:flex-row-reverse md:absolute">
              <div className="w-full sm:w-2/3 mb-5 lg:mb-0">
                <h1 className="font-light uppercase tracking-widest">
                  Products
                </h1>
                {results.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    onClick={() => router.push(`/products/${p.slug}`)}
                  >
                    <Image
                      src={p.variants[0]?.images[0]?.url.trimStart()}
                      alt={p.variants[0]?.images[0]?.altText}
                      width={80}
                      height={80}
                    />
                    <h1>{p.name}</h1>
                  </div>
                ))}
              </div>
              <div className="w-full sm:w-1/3 mb-5">
                <h1 className="font-light uppercase tracking-widest">
                  Categories
                </h1>
                {results.categories.map((c) => (
                  <div key={c.id}>
                    <Link href={`/categories/${c.name}`}>
                      <h1 className="p-2 font-light text-sm uppercase ">
                        {c.name
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" & ")}
                      </h1>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative w-full max-w-4xl">
          <div className="relative z-20">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Search"
                className="w-full p-2 border focus:outline-black focus:outline-1 relative"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Image
                src={"/assets/172546_search_icon.svg"}
                alt="Search-icon"
                width={40}
                height={10}
                className=" hover:text-gray-700 hoverEffect absolute right-0 top-1 px-2 py-1"
                onClick={handleSubmit}
              />
            </form>
          </div>
          {results.products.length > 0 || results.categories.length > 0 ? (
            <div className="fixed left-[-1]  z-10 bg-white w-screen md:w-full p-6 shadow-md flex flex-col lg:flex-row-reverse md:absolute">
              <div className="w-full sm:w-2/3 mb-7 ">
                <h1 className="font-light uppercase tracking-widest">
                  Products
                </h1>
                {results.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    onClick={() => router.push(`/products/${p.slug}`)}
                  >
                    <Image
                      src={p.variants[0]?.images[0]?.url.trimStart()}
                      alt={p.variants[0]?.images[0]?.altText}
                      width={80}
                      height={80}
                    />
                    {p.name}
                  </div>
                ))}
              </div>
              <div className="w-full sm:w-1/3 mb-5">
                <h1 className="font-light uppercase tracking-widest">
                  Categories
                </h1>
                {results.categories.map((c) => (
                  <div key={c.id}>
                    <Link href={`/categories/${c.name}`}>
                      <h1 className="p-2 font-light text-sm uppercase ">
                        {c.name
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" & ")}
                      </h1>
                    </Link>
                  </div>
                ))}
              </div>

              <h1
                className="absolute left-0 bottom-0 p-3 hover:text-gray-700 hoverEffect cursor-pointer"
                onClick={handleSubmit}
              >
                Show all results for “{query}” →
              </h1>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
