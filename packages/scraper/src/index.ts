// import {main as findTheads} from "./findTheadsUrl"
// import {main as scrapeTheads} from "./scrapeTheads"
import {main as normaliz} from "./normaliz"


async function main() {
  // await findTheads()
  // await scrapeTheads()
  normaliz()
}
main().catch(console.log)