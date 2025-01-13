import { BsSendFill } from "react-icons/bs";
import Spinner from "./Spinner";
import { UserPost } from "../types/user";
import { getUserPicture } from "../utils/functions";
import Input from "./inputs/Input";
import { FaComment } from "react-icons/fa";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface CreateCommentProps {
    user: UserPost;
    loadingComment: string;
    field: string;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors<FieldValues>;
    placeholder: string;
    id: string;
}

const CreateComment = ({
    user,
    loadingComment,
    field,
    id,
    placeholder,
    register,
    errors,
}: CreateCommentProps) => {
    return (
        <div className="flex">
            <img
                src={getUserPicture(user)}
                alt="Current User"
                className="w-10 h-10 rounded-full mr-2"
            />
            <div className={`flex-grow`}>
                <Input
                    relativeContainerStyle={{ marginTop: 0 }}
                    field={field}
                    placeholder={placeholder}
                    register={register}
                    errors={errors}
                    StartIcon={FaComment}
                />
            </div>
            <button
                disabled={loadingComment === id}
                type="submit"
                className="bg-[#D93025] hover:bg-[#bf2b1a] h-10 text-white py-2 px-6 rounded-xl ml-2 flex items-center justify-center"
            >
                {loadingComment === id ? (
                    <Spinner />
                ) : (
                    <BsSendFill size={20} />
                )}
            </button>
        </div>
    );
};

export default CreateComment;
