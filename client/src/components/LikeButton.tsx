import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import Spinner from "./Spinner";
import { authPost } from "../utils/requests";
import { toast } from "react-toastify";

interface LikeButtonProps {
    itemId: string; // מזהה הפוסט
    initialLikes: string[]; // רשימת מזהי המשתמשים שעשו לייק
    initialLikeCount: number; // מספר הלייקים
    onLikeChange: (updatedItem: { likes: string[]; likeCount: number }) => void; // פונקציה לעדכון הסטייט
}

const LikeButton = ({
    itemId,
    initialLikes,
    initialLikeCount,
    onLikeChange,
}: LikeButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [likes, setLikes] = useState<string[]>(initialLikes);
    const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // פונקציה לטיפול בלחיצה על כפתור הלייק
    const likeUnlikePost = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation(); // מונע שהתהליך יפגע בלחיצות אחרות
        setIsLoading(true);

        const updatedLikes = likes.includes(user._id)
            ? likes.filter((id) => id !== user._id) // אם המשתמש כבר לייק, מבצעים הסרה
            : [...likes, user._id]; // אחרת, מוסיפים את המשתמש ללייקים

        await authPost(
            `/post/${itemId}/like`,
            {},
            (message) => toast.error(message), // אם יש טעות, מציגים הודעה
            () => {
                setLikes(updatedLikes); // מעדכנים את הרשימה המקומית של הלייקים
                setLikeCount(updatedLikes.length); // מעדכנים את מספר הלייקים
                onLikeChange({
                    likes: updatedLikes,
                    likeCount: updatedLikes.length,
                }); // שולחים את העדכון לאובייקט הראשי
            }
        );

        setIsLoading(false);
    };

    return (
        <button
            onClick={likeUnlikePost} // פעולת הלייק/לא לייק
            disabled={isLoading} // אם הפונקציה בטעינה, לא ניתן ללחוץ
            className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-[#D93025]/10"
        >
            <FaHeart
                className={`h-4 w-4 ${
                    likes.includes(user._id) ? "text-[#D93025]" : ""
                }`} // צבע הלייק אם נעשה
            />
            <span className={likes.includes(user._id) ? "text-[#D93025]" : ""}>
                {isLoading ? <Spinner /> : likeCount}{" "}
                {/* אם בטעינה, מראה את הספינר, אחרת את מספר הלייקים */}
            </span>
        </button>
    );
};

export default LikeButton;
