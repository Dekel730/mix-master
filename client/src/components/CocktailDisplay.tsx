import { FaComment, FaEllipsisV, FaTrash } from "react-icons/fa";
import IconMenu from "./IconMenu";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import LikeButton from "./LikeButton";
import { authPost } from "../utils/requests";
import { toast } from "react-toastify";
import { ICocktail } from "../types/cocktail";
import ItemUser from "./ItemUser";

interface CocktailDisplayProps {
    cocktail: ICocktail;
    likeUnlike: (cocktail: ICocktail) => void;
}

const CocktailDisplay = ({ cocktail, likeUnlike }: CocktailDisplayProps) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

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

    const handlePostLike = async (postId: string) => {
        await authPost(
            `/post/${postId}/like`,
            {},
            (message) => toast.error(message), // אם יש טעות, מציגים הודעה
            () => {
                likeUnlike({
                    ...cocktail,
                    likes: cocktail.likes.includes(user._id)
                        ? cocktail.likes.filter((id: string) => id !== user._id)
                        : [...cocktail.likes, user._id],
                    likeCount: cocktail.likes.includes(user._id)
                        ? cocktail.likeCount - 1
                        : cocktail.likeCount + 1,
                });
            }
        );
    };

    const goToCocktail = () => {
        navigate(`/cocktail/${cocktail._id}`);
    };

    return (
        <div className="bg-[#212121] rounded-lg border border-zinc-700">
            <div className="p-4 flex items-center">
                <ItemUser user={cocktail.user} createdAt={cocktail.createdAt} />
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
                        likeAction={handlePostLike}
                        likeCount={cocktail.likes.length}
                        isLiked={cocktail.likes.includes(user._id)}
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
