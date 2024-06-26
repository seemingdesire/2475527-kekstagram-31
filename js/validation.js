import { sendData } from './api.js';
import { closeModal } from './form.js';
import { showErrorModal, showSuccessModal } from './message.js';

const HASHTAG = /^#[a-zа-яё0-9]{1,19}$/i;
const MAX_HASHTAGS = 5;
const MAX_SYMBOLS = 20;
const MAX_LENGTH_COMMENT = 140;

const submitButtonText = {
  IDLE: 'Сохранить',
  SENDING: 'Сохраняю...'
};

const form = document.querySelector('.img-upload__form');
const hashtagsField = form.querySelector('.text__hashtags');
const descriptionField = form.querySelector('.text__description');
const submitButton = form.querySelector('.img-upload__submit');

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__field-wrapper--error',
});

const validateDescription = (value) => value.length <= MAX_LENGTH_COMMENT;

pristine.addValidator(descriptionField,
  validateDescription,
  `Комментарий не может содержать более ${MAX_LENGTH_COMMENT} символов`,
);

const normalizeTags = (tags) => tags.trim().split(' ').map((tag) => tag.toLowerCase()).filter((tag) => tag.trim().length);
const checkAmountHashtags = (value) => normalizeTags(value).length <= MAX_SYMBOLS;
const validateHashtags = (value) => normalizeTags(value).every((tag) => HASHTAG.test(tag));
const validateUniqueHashtags = (value) => normalizeTags(value).length === new Set(normalizeTags(value)).size;

pristine.addValidator(hashtagsField,
  checkAmountHashtags,
  `Можно добавить не более ${MAX_HASHTAGS} хештегов.`,
);

pristine.addValidator(hashtagsField,
  validateHashtags,
  `Хэштег должен начинаться с # и содержать не более ${MAX_SYMBOLS} символов.`,
);

pristine.addValidator(hashtagsField,
  validateUniqueHashtags,
  'Хэштеги не должны повторяться.',
);

const resetValidator = () => {
  pristine.reset();
};

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = submitButtonText.SENDING;
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = submitButtonText.IDLE;
};

const setFormSubmit = () => {
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();
    if (isValid) {
      blockSubmitButton();
      sendData(new FormData(evt.target))
        .then(() => {
          showSuccessModal();
          closeModal();
        })
        .catch(() => {
          showErrorModal();
        })
        .finally(unblockSubmitButton);
    }
  });
};

export { setFormSubmit, resetValidator };

