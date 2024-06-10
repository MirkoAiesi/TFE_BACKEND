import vine from '@vinejs/vine'

export const addRestaurantValidator = vine.compile(
  vine.object({
    name: vine.string().trim().escape().optional(),
    address: vine.string().trim().escape().optional(),
    options: vine.string().trim().escape().optional(),
    status: vine.number().optional(),
    phone: vine.string().trim().escape().optional(),
    cooking_type: vine.string().trim().escape().optional(),
    price: vine.string().trim().escape().optional(),
    cultery: vine.number().optional(),
    schedule: vine.object({
      lundi: vine.array(vine.string()).optional(),
      mardi: vine.array(vine.string()).optional(),
      mercredi: vine.array(vine.string()).optional(),
      jeudi: vine.array(vine.string()).optional(),
      vendredi: vine.array(vine.string()).optional(),
      samedi: vine.array(vine.string()).optional(),
      dimanche: vine.array(vine.string()).optional()
    }).optional(),
    cutTime: vine.string().trim().escape().optional(),
    vacancy: vine.string().trim().escape().optional(),
    rating: vine.number().optional(),
    facebook: vine.string().trim().escape().optional(),
    instagram: vine.string().trim().escape().optional(),
    web: vine.string().trim().escape().optional()


  })
)
