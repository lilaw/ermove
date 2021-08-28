<template>
  <article>
    <h2>{{ thead.title }}</h2>
    <p>{{ thead.author }} &nbsp; {{ thead.releaseDate }}</p>
    <section v-html="thead.html"></section>
    <img
      :src="`/img/${img.filename}`"
      alt="unkonw"
      v-for="img in thead.imgs"
      :key="img.filename"
    />
  </article>
</template>

<script >
export default {
  async asyncData({ $content, route, redirect}) {
    const { node, slug } = route.params;
    const dataBasePath = whichZoneHasThis(node);
    const page = await $content(dataBasePath).fetch();
    const thead = page.entities.theads[slug.slice(0, 25)];

    if (thead === undefined) return redirect('/404')
    return {
      thead
    };
    function whichZoneHasThis(node) {
      const mainZone = [
        "中港台劇集",
        "韓日歐美劇集",
        "綜藝節目",
        "電影交流",
        "動畫交流",
        "體育節目交流",
        "電台節目交流",
        "音樂交流",
        "貼圖及設計素材",
        "遊戲及軟件交流"
      ].includes(node);
      const otherZone = ["閒談影視娛樂", "吹水/話題討論/問題發表"].includes(
        node
      );
      const completedZone = [
        "中港台劇集 (全集)",
        "韓日歐美劇集 (全集)",
        "本地綜藝節目 (全集)",
        "其它綜藝節目 (全集)"
      ].includes(node);
      if ([mainZone, otherZone, completedZone].every(bo => bo === false)) redirect('/404')


      return mainZone
        ? "mainZoneTheads"
        : otherZone
        ? "otherZoneTheads"
        : "completedZoneTheads";
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  display: block;
  margin-top: 1rem;
  max-width: 30rem;
}
</style>
