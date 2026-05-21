import {
  addCard,
  changeLikeCardStatus,
  deleteCard as deleteCardRequest,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";
import {
  createCardElement,
  removeCardElement,
  setCardLikesState,
} from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
  errorSpanSelector: ".popup__error",
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const logoElement = document.querySelector(".header__logo");
const statsModalWindow = document.querySelector(".popup_type_info");

let currentUserId = "";

const renderLoading = (buttonElement, isLoading, buttonText, loadingText) => {
  buttonElement.textContent = isLoading ? loadingText : buttonText;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const setUserData = (userData) => {
  currentUserId = userData._id;
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url("${userData.avatar}")`;
};

const createDefinitionItem = (term, description) => {
  const statsDefinitionTemplate = document.getElementById(
    "popup-info-definition-template"
  );
  if (!statsDefinitionTemplate) {
    return document.createElement("div");
  }
  const definitionElement = statsDefinitionTemplate.content
    .querySelector(".popup__info-item")
    .cloneNode(true);
  definitionElement.querySelector(".popup__info-term").textContent = term;
  definitionElement.querySelector(".popup__info-description").textContent =
    String(description);
  return definitionElement;
};

const createUserBadge = (name) => {
  const statsUserBadgeTemplate = document.getElementById(
    "popup-info-user-preview-template"
  );
  if (!statsUserBadgeTemplate) {
    const fallbackItem = document.createElement("li");
    fallbackItem.textContent = name;
    return fallbackItem;
  }
  const listItemElement = statsUserBadgeTemplate.content
    .querySelector(".popup__list-item")
    .cloneNode(true);
  listItemElement.textContent = name;
  return listItemElement;
};

const getCardsStats = (cards) => {
  const usersMap = new Map();
  const likesGivenByUser = {};
  let totalLikes = 0;

  cards.forEach((card) => {
    usersMap.set(card.owner._id, card.owner.name);
    totalLikes += card.likes.length;

    card.likes.forEach((user) => {
      usersMap.set(user._id, user.name);
      likesGivenByUser[user._id] = (likesGivenByUser[user._id] ?? 0) + 1;
    });
  });

  let championUserName = "Нет данных";
  let maxLikesFromOneUser = 0;

  Object.keys(likesGivenByUser).forEach((userId) => {
    if (likesGivenByUser[userId] > maxLikesFromOneUser) {
      maxLikesFromOneUser = likesGivenByUser[userId];
      championUserName = usersMap.get(userId) ?? championUserName;
    }
  });

  const popularCards = cards
    .slice()
    .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
    .slice(0, 3)
    .map((card) => card.name);

  return {
    totalUsers: usersMap.size,
    totalLikes,
    maxLikesFromOneUser,
    championUserName,
    popularCards,
  };
};

const renderStatsPopup = (cards) => {
  if (!statsModalWindow) {
    return;
  }

  const stats = getCardsStats(cards);
  const statsTitleElement = statsModalWindow.querySelector(".popup__title");
  const statsDefinitionList = statsModalWindow.querySelector(".popup__info");
  const statsTextElement = statsModalWindow.querySelector(".popup__text");
  const statsPopularList = statsModalWindow.querySelector(".popup__list");
  const statsDefinitionTemplate = document.getElementById(
    "popup-info-definition-template"
  );
  const statsUserBadgeTemplate = document.getElementById(
    "popup-info-user-preview-template"
  );

  if (
    !statsTitleElement ||
    !statsDefinitionList ||
    !statsTextElement ||
    !statsPopularList ||
    !statsDefinitionTemplate ||
    !statsUserBadgeTemplate
  ) {
    return;
  }

  statsTitleElement.textContent = "Статистика карточек";
  statsTextElement.textContent = "Популярные карточки:";
  statsDefinitionList.replaceChildren();
  statsPopularList.replaceChildren();

  statsDefinitionList.append(
    createDefinitionItem("Всего пользователей:", stats.totalUsers),
    createDefinitionItem("Всего лайков:", stats.totalLikes),
    createDefinitionItem(
      "Максимально лайков от одного:",
      stats.maxLikesFromOneUser
    ),
    createDefinitionItem("Чемпион лайков:", stats.championUserName)
  );

  if (stats.popularCards.length === 0) {
    statsPopularList.append(createUserBadge("Нет данных"));
    return;
  }

  stats.popularCards.forEach((cardName) => {
    statsPopularList.append(createUserBadge(cardName));
  });
};

const handleOpenStatsPopup = () => {
  if (!statsModalWindow) {
    return;
  }

  getCardList()
    .then((cards) => {
      renderStatsPopup(cards);
      openModalWindow(statsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardRequest(cardId)
    .then(() => {
      removeCardElement(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, isLiked, likeButton, likeCountElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      setCardLikesState(
        updatedCard.likes,
        currentUserId,
        likeButton,
        likeCountElement
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onDeleteCard: handleDeleteCard,
    onLikeCard: handleLikeCard,
  });

  if (method === "prepend") {
    placesWrap.prepend(cardElement);
    return;
  }
  placesWrap.append(cardElement);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранить", "Сохранение...");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setUserData(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранить", "Сохранение...");
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      setUserData(userData);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Создать", "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Создать", "Создание...");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

if (logoElement) {
  logoElement.addEventListener("click", handleOpenStatsPopup);
}

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    setUserData(userData);
    cards.forEach((card) => {
      try {
        renderCard(card);
      } catch (err) {
        console.log(err);
      }
    });
  })
  .catch((err) => {
    console.log(err);
    getUserInfo()
      .then((userData) => {
        setUserData(userData);
      })
      .catch((userErr) => {
        console.log(userErr);
      });
  });
