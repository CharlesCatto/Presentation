import { toast } from "react-toastify";

const successToast = (message: string) => {
  toast.success(message);
};

const errorToast = (message: string) => {
  toast.error(message);
};

const warningToast = (message: string) => {
  toast.warning(message);
};

const infoToast = (message: string) => {
  toast.info(message);
};

export { successToast, errorToast, warningToast, infoToast };
