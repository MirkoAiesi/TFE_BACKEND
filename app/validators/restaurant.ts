import vine from '@vinejs/vine'

export const addRestaurantValidator = vine.compile(
  vine.object({
    name: vine.string().trim().escape().optional(),
    address: vine.string().trim().escape().optional(),
    desc: vine.string().trim().escape().optional(),
  })
)
