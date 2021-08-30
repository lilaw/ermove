<template>
  <main>
    <section v-for="zone in zones" :key="zone.topic" class="zone">
      <h2 class="zone__topic">{{zone.topic}}</h2>
      <NuxtLink class="zone__node" :to="`${encodeURIComponent(node)}`" :key="node.title" v-for="node in zone.sourceNodes">
        <h3 class="zone__node-title">{{node}}</h3>
      </NuxtLink>
    </section>
  </main>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('theads').fetch()
    const zones = page.entities.zones

    return {
      zones
    }
  }
}
</script>

<style lang="scss" scoped>
.zone {
  display: grid;
  grid-template-columns: repeat(4, 8rem);
  column-gap: 1rem;
}
.zone__topic {
  grid-column: 1 / -1;;
}

</style>