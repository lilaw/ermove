import {main as findTheads} from "./findTheadsUrl"
import {main as scrapeTheads} from "./scrapeTheads"


async function main() {
  await findTheads()
  await scrapeTheads()
}
main().catch(console.log)