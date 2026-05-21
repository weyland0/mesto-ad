const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

const isCardLikedByUser = (likes, userId) =>
  Array.isArray(likes) && likes.some((user) => user._id === userId);

export const setCardLikesState = (
  likes,
  userId,
  likeButtonElement,
  likeCountElement
) => {
  if (likeCountElement) {
    likeCountElement.textContent = Array.isArray(likes) ? likes.length : 0;
  }
  likeButtonElement.classList.toggle(
    "card__like-button_is-active",
    isCardLikedByUser(likes, userId)
  );
};

export const isLikeButtonActive = (likeButtonElement) =>
  likeButtonElement.classList.contains("card__like-button_is-active");

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (cardData, userId, handlers) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;
  setCardLikesState(cardData.likes ?? [], userId, likeButton, likeCountElement);

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else if (handlers.onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      handlers.onDeleteCard(cardData._id, cardElement)
    );
  }

  if (handlers.onLikeCard) {
    likeButton.addEventListener("click", () =>
      handlers.onLikeCard(
        cardData._id,
        isLikeButtonActive(likeButton),
        likeButton,
        likeCountElement
      )
    );
  }

  if (handlers.onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      handlers.onPreviewPicture({ name: cardData.name, link: cardData.link })
    );
  }

  return cardElement;
};
