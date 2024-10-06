import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'

const handler = NewsletterAPI({
  provider: siteMetadata.newsletter.provider, // Use one of mailchimp, buttondown, convertkit, klaviyo emailOctopus
})

export { handler as GET, handler as POST }