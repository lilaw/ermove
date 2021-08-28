<template>
  <main>
 <article>
  <h2>{{node.title}}</h2>
  <section class="theads">
    <a :href="`${node.title}/${encodeURIComponent(thead.title)}`" v-for="thead in theads" :key="thead.title" class="thead">
      <span class="thead__status">{{thead.status}}</span>
      <span class="thead__title">{{thead.title}}</span>
      <span class="thead__author">{{thead.author}}</span>
    </a>
  </section>

  </article>
  </main>
</template>

<script>
export default {
  async asyncData ({ $content, route , redirect}) {
    const nodeParam = route.params.node
    const page = await $content('theads')
      .fetch()
      
    const node = page.entities.nodes[nodeParam]
    if (node == undefined) return redirect('/404')
    const theads = node.theads.map(title => page.entities.theads[title])

    return {
      node,
      theads,
    }
  }
}
</script>

<style lang="scss" scoped>
.theads {
  width: 50rem;
}
.thead {
  color: currentColor;
  display: flex;
  column-gap: 1rem;;
  text-decoration: none;
  margin-top: 1rem;
  background-color: #5551;
  padding: .5rem;

  &__author {
    margin-left: auto;
  }
}

</style>