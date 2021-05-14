<!--
//  OverlayShell.vue
//
//  Created by Kalila L. on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .outer {
        position: absolute;
    }

    div.title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    div.resize {
        position: absolute;
        opacity: 0;
    }
    div.resize-top, div.resize-nw, div.resize-ne, div.resize-bottom, div.resize-sw, div.resize-se {
        height: 15px;
    }
    div.resize-top, div.resize-nw, div.resize-ne {
        top: -10px;
    }
    div.resize-bottom, div.resize-sw, div.resize-se {
        bottom: -10px;
    }
    div.resize-top, div.resize-bottom {
        width: 100%;
        cursor: ns-resize;
    }
    div.resize-left, div.resize-nw, div.resize-ne, div.resize-right, div.resize-sw, div.resize-se {
        width: 15px;
    }
    div.resize-left, div.resize-nw, div.resize-sw {
        left: -10px;
    }
    div.resize-right, div.resize-ne, div.resize-se {
        right: -10px;
    }
    div.resize-left, div.resize-right {
        height: 100%;
        cursor: ew-resize;
    }
    div.resize-nw, div.resize-se {
        cursor: nwse-resize;
    }
    div.resize-ne, div.resize-sw {
        cursor: nesw-resize;
    }
</style>

<template>
    <q-card
        class="outer column no-wrap items-stretch"
        @mouseenter="hovered=true"
        @mouseleave="hovered=false"
        @mousedown="$emit('overlay-action', 'select')"
        :style="{
            // Dimensions
            height: height + 'px', // Should these two be a string so that we can define vh or whatever at will?
            width: width + 'px',
            // Positioning
            top: top + 'px',
            left: left + 'px',
        }"
    >
        <q-slide-transition>
            <q-bar
                v-show="!hoverShowBar || overlayHovered"
            >
                <q-icon :name="icon" />
                <div class="title" @mousedown="if(canMove) beginAction($event, 'move')">{{ title }}</div>

                <q-space @mousedown.native="if(canMove) beginAction($event, 'move') />

                <q-btn dense flat :icon="windowStatus=='minimized'?'flip_to_front':'minimize'" @click="$emit('overlay-action', 'minimize')" />
                <q-btn dense flat :icon="windowStatus=='maximized'?'flip_to_front':'crop_square'" @click="$emit('overlay-action', 'maximize')" />
                <q-btn dense flat icon="close" @click="$emit('overlay-action', 'close') />
            </q-bar>
        </q-slide-transition>

        <q-card-section
            class="col q-pa-none"
        >
            <slot />
        </q-card-section>

        <div v-if="canResize && canResizeHeight" class="resize resize-top" @mousedown="beginAction($event, 'resize-top')" />
        <div v-if="canResize && canResizeHeight" class="resize resize-bottom" @mousedown="beginAction($event, 'resize-bottom')" />
        <div v-if="canResize && canResizeWidth" class="resize resize-left" @mousedown="beginAction($event, 'resize-left')" />
        <div v-if="canResize && canResizeWidth" class="resize resize-right" @mousedown="beginAction($event, 'resize-right')" />
        <div v-if="canResize && canResizeWidth && canResizeWidth" class="resize resize-nw" @mousedown="beginAction($event, 'resize-nw')" />
        <div v-if="canResize && canResizeWidth && canResizeWidth" class="resize resize-ne" @mousedown="beginAction($event, 'resize-ne')" />
        <div v-if="canResize && canResizeWidth && canResizeWidth" class="resize resize-sw" @mousedown="beginAction($event, 'resize-sw')" />
        <div v-if="canResize && canResizeWidth && canResizeWidth" class="resize resize-se" @mousedown="beginAction($event, 'resize-se')" />
    </q-card>
</template>

<script>
export default {
    props: {
        // Primary
        icon: { type: String, required: true },
        title: { type: String, required: true },
        hoverShowBar: { type: Boolean, default: false },

        // Dimensions
        defaultHeight: { type: Number, default: 400 },
        defaultWidth: { type: Number, default: 300 },
        minimumHeight: { type:Number, default:50 },
        minimumWidth: { type:Number, default:50 },
        maximumHeight: { type:Number, default:undefined },
        maximumWidth: { type:Number, default:undefined },

        // Positioning
        defaultTop: { type: Number, default: 200 },
        defaultLeft: { type: Number, default: 400 },
        minimumExposure: { type:Number, default:100 },

        // Behavior
        canMove: { type:Boolean, default:true },
        canResize: { type:Boolean, default:true },
        canResizeWidth: { type:Boolean, default:true },
        canResizeHeight: { type:Boolean, default:true },

        // info from parent/manager
        windowStatus: { type: String, default: 'restored' },
        parentSize: { type:Object, required:true },
    },

    data () {
        return {
            // Settings and Properties
            height: this.defaultHeight,
            width: this.defaultWidth,
            top: this.defaultTop,
            left: this.defaultLeft,
            
            // Internal
            hovered: false,
            dragAction: undefined,
            dragStart: undefined,
            mouseCaptured: false,
        };
    },

    watch: {
        mouseCaptured(newVal) {
            if(newVal) {
                window.addEventListener('mousemove', this.onDragMove, true);
                window.addEventListener('mouseup', this.onDragDone, true);
            } else {
                window.removeEventListener('mousemove', this.onDragMove, true);
                window.removeEventListener('mouseup', this.onDragDone, true);
            }
        },
    },

    computed: {
    },

    methods: {
        dragBehavior(action) {
            let top = 0;
            let left = 0;
            let width = 0;
            let height = 0;
            switch(action) {
                case 'move':
                    top = +1;
                    left = +1;
                    break;
                case 'resize-top':
                    top = +1;
                    height = -1;
                    break;
                case 'resize-bottom':
                    height = +1;
                    break;
                case 'resize-left':
                    left = +1;
                    width = -1;
                    break;
                case 'resize-right':
                    width = +1;
                    break;
                case 'resize-nw':
                    top = +1;
                    left = +1;
                    height = -1;
                    width = -1;
                    break;
                case 'resize-ne':
                    top = +1;
                    height = -1;
                    width = +1;
                    break;
                case 'resize-sw':
                    left = +1;
                    width = -1;
                    height = +1;
                    break;
                case 'resize-se':
                    height = +1;
                    width = +1;
                    break;
            }
            return {top:top,left:left,width:width,height:height};
        },

        beginAction(event, action) {
            this.dragAction = action;
            this.dragStart = {x:event.screenX,y:event.screenY};
            this.mouseCaptured = true;
        },

        applyDrag(pageX, pageY) {
            if(!this.dragAction || !this.dragStart) return; // shouldn't be here, get out now
            const behavior = this.dragBehavior(this.action);
            const offsetX = pageX - this.dragStart.x;
            const offsetY = pageY - this.dragStart.y;

            // apply the size changes first and enforce min/max sizes
            let newWidth = this.width + offsetX * behavior.width;
            if(this.minimumWidth && newWidth < this.minimumWidth) {
                newWidth = this.minimumWidth;
                offsetX = (newWidth - this.width) * behavior.width;
            }
            if(this.maximumWidth && newWidth > this.maximumWidth) {
                newWidth = this.maximumWidth;
                offsetX = (newWidth - this.width) * behavior.width;
            }

            let newHeight = this.height + offsetY * behavior.height;
            if(this.minimumHeight && newHeight < this.minimumHeight) {
                newHeight = this.minimumHeight;
                offsetX = (newHeight - this.height) * behavior.height;
            }
            if(this.maximumHeight && newHeight > this.maximumHeight) {
                newHeight = this.maximumHeight;
                offsetX = (newHeight - this.height) * behavior.height;
            }

            this.width = newWidth;
            this.height = newHeight;
            this.top += offsetY * behavior.top;
            this.left += offsetX * behavior.left;
        },

        onDragMove(event) {
            this.applyDrag(event.screenX, event.screenY);
        },

        onDragDone(event) {
            this.applyDrag(event.screenX, event.screenY);
            this.mouseCaptured = false;
            this.dragAction = undefined;
            this.dragStart = undefined;
        },
    },

    mounted () {
    },

    destroyed() {
        if(this.mouseCaptured) {
            window.removeEventListener('mousemove', this.onDragMove, true);
            window.removeEventListener('mouseup', this.onDragDone, true);
        }
    },
};
</script>
