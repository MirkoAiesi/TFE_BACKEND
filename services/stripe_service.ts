import Stripe from 'stripe'
import env from '#start/env'

const stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-04-10',
})

export default stripe