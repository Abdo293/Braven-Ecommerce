import Link from "next/link";

export const PagesHeader = ({
  title,
  routes,
}: {
  title: string;
  routes: string;
}) => {
  return (
    <div className="flex justify-between items-center py-8">
      <h2 className="font-bold text-2xl">{title}</h2>
      <div className="text-gray-500 text-lg">
        <Link
          href={"/"}
          className="hover:text-blue-500 transition duration-200"
        >
          <span>Home</span>
        </Link>
        <span> / </span>
        <span>{routes}</span>
      </div>
    </div>
  );
};
