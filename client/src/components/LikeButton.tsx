import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import Spinner from "./Spinner";

interface LikeButtonProps {
    itemId: string; // מזהה הפוסט
    isLiked: boolean; // האם המשתמש לייק
    likeCount: number; // מספר הלייקים
    likeAction: (itemId: string) => Promise<void>; // פעולת הלייק
}

const LikeButton = ({
    itemId,
    likeCount,
    isLiked,
    likeAction,
}: LikeButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // פונקציה לטיפול בלחיצה על כפתור הלייק
    const likeUnlike = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation(); // מונע שהתהליך יפגע בלחיצות אחרות
        setIsLoading(true);
        await likeAction(itemId);
        setIsLoading(false);
    };

    return (
        <button
            onClick={likeUnlike} // פעולת הלייק/לא לייק
            disabled={isLoading} // אם הפונקציה בטעינה, לא ניתן ללחוץ
            className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-[#D93025]/10"
        >
            <FaHeart
                className={`h-4 w-4 ${isLiked ? "text-[#D93025]" : ""}`} // צבע הלייק אם נעשה
            />
            <span className={isLiked ? "text-[#D93025]" : ""}>
                {isLoading ? <Spinner /> : likeCount}{" "}
                {/* אם בטעינה, מראה את הספינר, אחרת את מספר הלייקים */}
            </span>
        </button>
    );
};

export default LikeButton;
