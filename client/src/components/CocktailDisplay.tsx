import { FaComment, FaEllipsisV, FaTrash } from "react-icons/fa";
import { getUserPicture } from "../utils/functions";
import IconMenu from "./IconMenu";
import TimeAgo from "javascript-time-ago";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import LikeButton from "./LikeButton"; // ייבוא של הקומפוננטה החדשה

interface CocktailDisplayProps {
    cocktail: any;
    likeUnlike: (cocktail: any) => void;
}

const CocktailDisplay = ({ cocktail, likeUnlike }: CocktailDisplayProps) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const timeAgo = new TimeAgo("en-US");

    const navigate = useNavigate();
    const options = [
        {
            element: (
                <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-b-lg cursor-pointer">
                    <FaEllipsisV className="inline-block mr-2" /> Edit
                </span>
            ),
            onClick: () => console.log("Edit"),
            id: "edit",
        },
        {
            element: (
                <span className="block px-4 py-2 text-sm hover:bg-[#333333] rounded-b-lg cursor-pointer text-red-500">
                    <FaTrash className="inline-block mr-2" /> Delete
                </span>
            ),
            onClick: () => console.log("Delete"),
            id: "delete",
        },
    ];

    const goToCocktail = () => {
        navigate(`/cocktail/${cocktail._id}`);
    };

    const gotoUserProfile = (
        e: React.MouseEvent<HTMLDivElement | HTMLParagraphElement, MouseEvent>
    ) => {
        e.stopPropagation();
        navigate(`/user/${cocktail.user._id}`);
    };

    const handleLikeChange = (updatedCocktail: {
        likes: string[];
        likeCount: number;
    }) => {
        likeUnlike({
            ...cocktail,
            likes: updatedCocktail.likes,
            likeCount: updatedCocktail.likeCount,
        });
    };

    return (
        <div className="bg-[#212121] rounded-lg border border-zinc-700">
            <div className="p-4 flex items-center">
                <div
                    onClick={gotoUserProfile}
                    className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
                >
                    <img
                        src={getUserPicture(cocktail.user)}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="ml-3 flex-1">
                    <Link to={`/user/${cocktail.user._id}`}>
                        <p className="text-sm font-medium hover:text-[#D93025] hover:underline inline">
                            {cocktail.user.f_name} {cocktail.user.l_name}
                        </p>
                    </Link>
                    <p className="text-xs text-zinc-400">
                        {timeAgo.format(new Date(cocktail.createdAt))}
                    </p>
                </div>
                {user._id === cocktail.user._id && (
                    <IconMenu
                        Icon={<FaEllipsisV className="h-4 w-4" />}
                        options={options}
                        buttonClassName="flex justify-center items-center w-9 h-9"
                    />
                )}
            </div>
            <div className="p-4 space-y-4">
                <Link to={`/cocktail/${cocktail._id}`}>
                    <h1 className="text-2xl font-bold text-center p-1">
                        {cocktail.title}
                    </h1>
                </Link>
                <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop={true}
                    emulateTouch={true}
                    swipeable={true}
                    dynamicHeight={true}
                >
                    {cocktail.images.map((image: string, index: number) => (
                        <div key={index}>
                            <img
                                src={`${
                                    import.meta.env.VITE_API_ADDRESS
                                }/${image}`}
                                alt={`${cocktail.title} - Image ${index + 1}`}
                                className="w-full object-contain max-h-[600px]"
                            />
                        </div>
                    ))}
                </Carousel>

                <div className="flex items-center space-x-4">
                    <LikeButton
                        itemId={cocktail._id}
                        initialLikes={cocktail.likes}
                        initialLikeCount={cocktail.likeCount}
                        onLikeChange={handleLikeChange} // עדכון נתוני הלייק
                    />
                    <button
                        onClick={goToCocktail}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-zinc-700"
                    >
                        <FaComment className="h-4 w-4" />
                        <span>{cocktail.commentCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CocktailDisplay;
