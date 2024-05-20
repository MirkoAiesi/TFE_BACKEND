import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'email.email': "Merci d'entrer un mail valide.",
  'password.minLength': 'Le mot de passe de faire minimum 8 caractères.',
  'password.maxLength': 'Le mot de passe de faire maximum 20 caractères.',
  'first_name.required': 'Merci de renseigner un prénom.',
  'last_name.required': 'Merci de renseigner un prénom.',
  'email.required': 'Merci de renseigner un prénom.',
  'password.required': 'Merci de renseigner un prénom.',
  'confirmPassword.sameAs': 'Les mots de passes sont différents.',
})

export const registerUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().escape(),
    last_name: vine.string().trim().escape(),
    email: vine.string().trim().escape().email(),
    password: vine.string().trim().escape().minLength(8).maxLength(20),
    birthday: vine.date(),
  })
)
export const changePasswordValidator = vine.compile(
  vine.object({
    password: vine.string().trim().escape().minLength(8).maxLength(20),
    newPassword: vine.string().trim().escape().minLength(8).maxLength(20),
    confirmPassword: vine.string().trim().escape().minLength(8).maxLength(20).sameAs('newPassword'),
  })
)
