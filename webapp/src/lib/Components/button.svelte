<script lang="ts">
    export let props: any = {}
    export let onclick: any = () => {}
    const colour: string = (typeof props.colour === 'undefined') ? "bg-stone-300 dark:bg-stone-700" : props.colour;
    const hoverColour: string = (typeof props.hoverColour === 'undefined') ? "bg-stone-400" : props.hoverColour;
</script>

<button on:click={onclick} class="text-center {colour} hover:{hoverColour} dark:hover:bg-stone-600 rounded flex justify-center py-2 px-4">
    <slot/>
</button>