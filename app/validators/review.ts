import vine from '@vinejs/vine'

export const addRatingValidator = vine.compile(
  vine.object({
    restaurant_id: vine.number(),
    rating: vine.number(),
    comment: vine.string().trim().escape(),
  })
)
