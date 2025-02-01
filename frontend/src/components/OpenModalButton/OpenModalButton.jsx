import { useModal } from '../../context/Modal';

function OpenModalButton({
    modalComponent, 
    buttonText, 
    onButtonCLick, 
    onModalClose
}) {
    const { setModalContent, setOnModalClose} = useModal();

    const onClick = () => {
        if (onModalClose) setOnModalClose(onModalClose);
        setModalContent(modalComponent);
        if (typeof onButtonCLick === "function") onButtonCLick();
    };

    return <button onClick={onClick}>{buttonText}</button>;
} 



export default OpenModalButton;