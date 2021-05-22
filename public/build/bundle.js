
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    const nodes_to_detach = new Set();
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
        for (const node of nodes_to_detach) {
            node.parentNode.removeChild(node);
        }
        nodes_to_detach.clear();
    }
    function append(target, node) {
        if (is_hydrating) {
            nodes_to_detach.delete(node);
        }
        if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating) {
            nodes_to_detach.delete(node);
        }
        if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        if (is_hydrating) {
            nodes_to_detach.add(node);
        }
        else if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Button.svelte generated by Svelte v3.38.1 */
    const file$2 = "src\\components\\Button.svelte";

    // (19:2) {#if img !== ""}
    function create_if_block(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[1])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", "Иконка");
    			attr_dev(img_1, "class", "svelte-18qxeg2");
    			add_location(img_1, file$2, 19, 4, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*img*/ 2 && img_1.src !== (img_1_src_value = /*img*/ ctx[1])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:2) {#if img !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let button;
    	let t0;
    	let span;
    	let t1_value = (/*name*/ ctx[0] !== "" ? /*name*/ ctx[0] : "") + "";
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*img*/ ctx[1] !== "" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-18qxeg2");
    			add_location(span, file$2, 22, 2, 432);
    			button.disabled = /*disabled*/ ctx[2];
    			attr_dev(button, "class", "svelte-18qxeg2");
    			add_location(button, file$2, 17, 0, 317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*buttonClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*img*/ ctx[1] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(button, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*name*/ 1 && t1_value !== (t1_value = (/*name*/ ctx[0] !== "" ? /*name*/ ctx[0] : "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*disabled*/ 4) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { name = "" } = $$props;
    	let { img = "" } = $$props;
    	let { id = "" } = $$props;
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function buttonClick() {
    		dispatch("buttonClick", { text: id });
    	}

    	const writable_props = ["name", "img", "id", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("img" in $$props) $$invalidate(1, img = $$props.img);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		name,
    		img,
    		id,
    		disabled,
    		dispatch,
    		buttonClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("img" in $$props) $$invalidate(1, img = $$props.img);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, img, disabled, buttonClick, id];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, img: 1, id: 4, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get name() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get img() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MainMenu.svelte generated by Svelte v3.38.1 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\MainMenu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (30:4) {#each tabConfig as tab, i}
    function create_each_block_3(ctx) {
    	let li;
    	let t_value = /*tab*/ ctx[5].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "tabs-name__item svelte-gexmy");
    			toggle_class(li, "active", /*isActive*/ ctx[3] === /*i*/ ctx[7]);
    			add_location(li, file$1, 30, 6, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tabConfig*/ 1 && t_value !== (t_value = /*tab*/ ctx[5].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*isActive*/ 8) {
    				toggle_class(li, "active", /*isActive*/ ctx[3] === /*i*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(30:4) {#each tabConfig as tab, i}",
    		ctx
    	});

    	return block;
    }

    // (49:16) {#each groupButtonConfig[group].buttonIdArray as btn}
    function create_each_block_2(ctx) {
    	let button;
    	let current;
    	const button_spread_levels = [/*buttonConfig*/ ctx[2][/*btn*/ ctx[11]]];
    	let button_props = {};

    	for (let i = 0; i < button_spread_levels.length; i += 1) {
    		button_props = assign(button_props, button_spread_levels[i]);
    	}

    	button = new Button({ props: button_props, $$inline: true });
    	button.$on("buttonClick", buttonClick);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = (dirty & /*buttonConfig, groupButtonConfig, tabConfig*/ 7)
    			? get_spread_update(button_spread_levels, [get_spread_object(/*buttonConfig*/ ctx[2][/*btn*/ ctx[11]])])
    			: {};

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(49:16) {#each groupButtonConfig[group].buttonIdArray as btn}",
    		ctx
    	});

    	return block;
    }

    // (46:10) {#each tab.groupIdArray as group}
    function create_each_block_1(ctx) {
    	let li;
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*groupButtonConfig*/ ctx[1][/*group*/ ctx[8]].name + "";
    	let t1;
    	let t2;
    	let current;
    	let each_value_2 = /*groupButtonConfig*/ ctx[1][/*group*/ ctx[8]].buttonIdArray;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "button-group__body svelte-gexmy");
    			add_location(div0, file$1, 47, 14, 1325);
    			attr_dev(div1, "class", "button-group__title svelte-gexmy");
    			add_location(div1, file$1, 52, 14, 1574);
    			attr_dev(li, "class", "button-group__item svelte-gexmy");
    			add_location(li, file$1, 46, 12, 1278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(li, t0);
    			append_dev(li, div1);
    			append_dev(div1, t1);
    			append_dev(li, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buttonConfig, groupButtonConfig, tabConfig, buttonClick*/ 7) {
    				each_value_2 = /*groupButtonConfig*/ ctx[1][/*group*/ ctx[8]].buttonIdArray;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*groupButtonConfig, tabConfig*/ 3) && t1_value !== (t1_value = /*groupButtonConfig*/ ctx[1][/*group*/ ctx[8]].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(46:10) {#each tab.groupIdArray as group}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#each tabConfig as tab, i}
    function create_each_block(ctx) {
    	let li;
    	let ul;
    	let t;
    	let current;
    	let each_value_1 = /*tab*/ ctx[5].groupIdArray;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			li = element("li");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(ul, "class", "button-group__list svelte-gexmy");
    			add_location(ul, file$1, 44, 8, 1188);
    			attr_dev(li, "class", "tabs-contant__item svelte-gexmy");
    			toggle_class(li, "inactive", /*isActive*/ ctx[3] !== /*i*/ ctx[7]);
    			add_location(li, file$1, 40, 6, 1087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupButtonConfig, tabConfig, buttonConfig, buttonClick*/ 7) {
    				each_value_1 = /*tab*/ ctx[5].groupIdArray;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*isActive*/ 8) {
    				toggle_class(li, "inactive", /*isActive*/ ctx[3] !== /*i*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:4) {#each tabConfig as tab, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let ul0;
    	let t;
    	let ul1;
    	let current;
    	let each_value_3 = /*tabConfig*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value = /*tabConfig*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul0, "class", "tabs-name__list svelte-gexmy");
    			add_location(ul0, file$1, 28, 2, 779);
    			attr_dev(ul1, "class", "tabs-contant__list svelte-gexmy");
    			add_location(ul1, file$1, 38, 2, 1015);
    			attr_dev(div, "class", "menu svelte-gexmy");
    			add_location(div, file$1, 27, 0, 757);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div, t);
    			append_dev(div, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isActive, tabConfig*/ 9) {
    				each_value_3 = /*tabConfig*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*isActive, tabConfig, groupButtonConfig, buttonConfig, buttonClick*/ 15) {
    				each_value = /*tabConfig*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function buttonClick(event) {
    	console.log(event.detail.text);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MainMenu", slots, []);
    	let tabConfig = [];
    	let groupButtonConfig = [];
    	let buttonConfig = [];

    	onMount(async () => {
    		const buttonConfigRes = await fetch("http://localhost:5000/data/buttonConfig.json");
    		$$invalidate(2, buttonConfig = await buttonConfigRes.json());
    		const groupButtonConfigRes = await fetch("http://localhost:5000/data/groupButtonConfig.json");
    		$$invalidate(1, groupButtonConfig = await groupButtonConfigRes.json());
    		const tabConfigRes = await fetch("http://localhost:5000/data/tabConfig.json");
    		$$invalidate(0, tabConfig = await tabConfigRes.json());
    	});

    	
    	let isActive = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<MainMenu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => $$invalidate(3, isActive = i);

    	$$self.$capture_state = () => ({
    		Button,
    		onMount,
    		tabConfig,
    		groupButtonConfig,
    		buttonConfig,
    		buttonClick,
    		isActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabConfig" in $$props) $$invalidate(0, tabConfig = $$props.tabConfig);
    		if ("groupButtonConfig" in $$props) $$invalidate(1, groupButtonConfig = $$props.groupButtonConfig);
    		if ("buttonConfig" in $$props) $$invalidate(2, buttonConfig = $$props.buttonConfig);
    		if ("isActive" in $$props) $$invalidate(3, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabConfig, groupButtonConfig, buttonConfig, isActive, click_handler];
    }

    class MainMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainMenu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let header;
    	let mainmenu;
    	let t0;
    	let div0;
    	let main;
    	let table;
    	let tr0;
    	let th0;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t10;
    	let th5;
    	let t12;
    	let th6;
    	let t14;
    	let th7;
    	let t16;
    	let tr1;
    	let th8;
    	let t18;
    	let th9;
    	let t20;
    	let th10;
    	let t22;
    	let th11;
    	let t24;
    	let th12;
    	let t26;
    	let th13;
    	let t28;
    	let tr2;
    	let td0;
    	let t30;
    	let td1;
    	let t32;
    	let td2;
    	let t34;
    	let td3;
    	let t36;
    	let td4;
    	let t38;
    	let td5;
    	let t40;
    	let td6;
    	let t42;
    	let td7;
    	let t44;
    	let td8;
    	let t46;
    	let td9;
    	let t48;
    	let td10;
    	let t50;
    	let td11;
    	let t52;
    	let tr3;
    	let td12;
    	let t54;
    	let td13;
    	let t56;
    	let td14;
    	let t58;
    	let td15;
    	let t60;
    	let td16;
    	let t62;
    	let td17;
    	let t64;
    	let td18;
    	let t66;
    	let td19;
    	let t68;
    	let td20;
    	let t70;
    	let td21;
    	let t72;
    	let td22;
    	let t74;
    	let td23;
    	let t76;
    	let footer;
    	let current;
    	mainmenu = new MainMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			create_component(mainmenu.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			main = element("main");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "№ п/п";
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "Обоснование";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "Наименование работ и затрат";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "Единица измерения";
    			t8 = space();
    			th4 = element("th");
    			th4.textContent = "Количество";
    			t10 = space();
    			th5 = element("th");
    			th5.textContent = "Сметная стоимость в базисном уровне цен (в текущем уровне цен (гр. 8) для ресурсов отсутствующих в СНБ), руб.";
    			t12 = space();
    			th6 = element("th");
    			th6.textContent = "Индексы";
    			t14 = space();
    			th7 = element("th");
    			th7.textContent = "Сметная стоимость в текущем уровне цен, руб.";
    			t16 = space();
    			tr1 = element("tr");
    			th8 = element("th");
    			th8.textContent = "на единицу";
    			t18 = space();
    			th9 = element("th");
    			th9.textContent = "коэффициенты";
    			t20 = space();
    			th10 = element("th");
    			th10.textContent = "всего с учётом коэффициентов";
    			t22 = space();
    			th11 = element("th");
    			th11.textContent = "на единицу";
    			t24 = space();
    			th12 = element("th");
    			th12.textContent = "коэффициенты";
    			t26 = space();
    			th13 = element("th");
    			th13.textContent = "всего";
    			t28 = space();
    			tr2 = element("tr");
    			td0 = element("td");
    			td0.textContent = "1";
    			t30 = space();
    			td1 = element("td");
    			td1.textContent = "2";
    			t32 = space();
    			td2 = element("td");
    			td2.textContent = "3";
    			t34 = space();
    			td3 = element("td");
    			td3.textContent = "4";
    			t36 = space();
    			td4 = element("td");
    			td4.textContent = "5";
    			t38 = space();
    			td5 = element("td");
    			td5.textContent = "6";
    			t40 = space();
    			td6 = element("td");
    			td6.textContent = "7";
    			t42 = space();
    			td7 = element("td");
    			td7.textContent = "8";
    			t44 = space();
    			td8 = element("td");
    			td8.textContent = "9";
    			t46 = space();
    			td9 = element("td");
    			td9.textContent = "10";
    			t48 = space();
    			td10 = element("td");
    			td10.textContent = "11";
    			t50 = space();
    			td11 = element("td");
    			td11.textContent = "12";
    			t52 = space();
    			tr3 = element("tr");
    			td12 = element("td");
    			td12.textContent = "1";
    			t54 = space();
    			td13 = element("td");
    			td13.textContent = "2";
    			t56 = space();
    			td14 = element("td");
    			td14.textContent = "3";
    			t58 = space();
    			td15 = element("td");
    			td15.textContent = "4";
    			t60 = space();
    			td16 = element("td");
    			td16.textContent = "5";
    			t62 = space();
    			td17 = element("td");
    			td17.textContent = "6";
    			t64 = space();
    			td18 = element("td");
    			td18.textContent = "7";
    			t66 = space();
    			td19 = element("td");
    			td19.textContent = "8";
    			t68 = space();
    			td20 = element("td");
    			td20.textContent = "9";
    			t70 = space();
    			td21 = element("td");
    			td21.textContent = "10";
    			t72 = space();
    			td22 = element("td");
    			td22.textContent = "11";
    			t74 = space();
    			td23 = element("td");
    			td23.textContent = "12";
    			t76 = space();
    			footer = element("footer");
    			attr_dev(header, "class", "header svelte-171gfvy");
    			add_location(header, file, 5, 2, 99);
    			attr_dev(th0, "rowspan", "2");
    			attr_dev(th0, "class", "svelte-171gfvy");
    			add_location(th0, file, 17, 10, 295);
    			attr_dev(th1, "rowspan", "2");
    			attr_dev(th1, "class", "svelte-171gfvy");
    			add_location(th1, file, 18, 10, 332);
    			attr_dev(th2, "rowspan", "2");
    			attr_dev(th2, "class", "svelte-171gfvy");
    			add_location(th2, file, 19, 10, 375);
    			attr_dev(th3, "rowspan", "2");
    			attr_dev(th3, "class", "svelte-171gfvy");
    			add_location(th3, file, 20, 10, 434);
    			attr_dev(th4, "colspan", "3");
    			attr_dev(th4, "class", "svelte-171gfvy");
    			add_location(th4, file, 21, 10, 483);
    			attr_dev(th5, "colspan", "3");
    			attr_dev(th5, "class", "svelte-171gfvy");
    			add_location(th5, file, 22, 10, 525);
    			attr_dev(th6, "rowspan", "2");
    			attr_dev(th6, "class", "svelte-171gfvy");
    			add_location(th6, file, 23, 10, 666);
    			attr_dev(th7, "rowspan", "2");
    			attr_dev(th7, "class", "svelte-171gfvy");
    			add_location(th7, file, 24, 10, 705);
    			add_location(tr0, file, 16, 8, 280);
    			attr_dev(th8, "class", "svelte-171gfvy");
    			add_location(th8, file, 27, 10, 808);
    			attr_dev(th9, "class", "svelte-171gfvy");
    			add_location(th9, file, 28, 10, 838);
    			attr_dev(th10, "class", "svelte-171gfvy");
    			add_location(th10, file, 29, 10, 870);
    			attr_dev(th11, "class", "svelte-171gfvy");
    			add_location(th11, file, 30, 10, 918);
    			attr_dev(th12, "class", "svelte-171gfvy");
    			add_location(th12, file, 31, 10, 948);
    			attr_dev(th13, "class", "svelte-171gfvy");
    			add_location(th13, file, 32, 10, 980);
    			add_location(tr1, file, 26, 8, 793);
    			attr_dev(td0, "class", "svelte-171gfvy");
    			add_location(td0, file, 35, 10, 1032);
    			attr_dev(td1, "class", "svelte-171gfvy");
    			add_location(td1, file, 36, 10, 1053);
    			attr_dev(td2, "class", "svelte-171gfvy");
    			add_location(td2, file, 37, 10, 1074);
    			attr_dev(td3, "class", "svelte-171gfvy");
    			add_location(td3, file, 38, 10, 1095);
    			attr_dev(td4, "class", "svelte-171gfvy");
    			add_location(td4, file, 39, 10, 1116);
    			attr_dev(td5, "class", "svelte-171gfvy");
    			add_location(td5, file, 40, 10, 1137);
    			attr_dev(td6, "class", "svelte-171gfvy");
    			add_location(td6, file, 41, 10, 1158);
    			attr_dev(td7, "class", "svelte-171gfvy");
    			add_location(td7, file, 42, 10, 1179);
    			attr_dev(td8, "class", "svelte-171gfvy");
    			add_location(td8, file, 43, 10, 1200);
    			attr_dev(td9, "class", "svelte-171gfvy");
    			add_location(td9, file, 44, 10, 1221);
    			attr_dev(td10, "class", "svelte-171gfvy");
    			add_location(td10, file, 45, 10, 1243);
    			attr_dev(td11, "class", "svelte-171gfvy");
    			add_location(td11, file, 46, 10, 1265);
    			add_location(tr2, file, 34, 8, 1017);
    			attr_dev(td12, "class", "svelte-171gfvy");
    			add_location(td12, file, 49, 10, 1314);
    			attr_dev(td13, "class", "svelte-171gfvy");
    			add_location(td13, file, 50, 10, 1335);
    			attr_dev(td14, "class", "svelte-171gfvy");
    			add_location(td14, file, 51, 10, 1356);
    			attr_dev(td15, "class", "svelte-171gfvy");
    			add_location(td15, file, 52, 10, 1377);
    			attr_dev(td16, "class", "svelte-171gfvy");
    			add_location(td16, file, 53, 10, 1398);
    			attr_dev(td17, "class", "svelte-171gfvy");
    			add_location(td17, file, 54, 10, 1419);
    			attr_dev(td18, "class", "svelte-171gfvy");
    			add_location(td18, file, 55, 10, 1440);
    			attr_dev(td19, "class", "svelte-171gfvy");
    			add_location(td19, file, 56, 10, 1461);
    			attr_dev(td20, "class", "svelte-171gfvy");
    			add_location(td20, file, 57, 10, 1482);
    			attr_dev(td21, "class", "svelte-171gfvy");
    			add_location(td21, file, 58, 10, 1503);
    			attr_dev(td22, "class", "svelte-171gfvy");
    			add_location(td22, file, 59, 10, 1525);
    			attr_dev(td23, "class", "svelte-171gfvy");
    			add_location(td23, file, 60, 10, 1547);
    			add_location(tr3, file, 48, 8, 1299);
    			attr_dev(table, "class", "svelte-171gfvy");
    			add_location(table, file, 15, 6, 264);
    			attr_dev(main, "class", "main svelte-171gfvy");
    			add_location(main, file, 14, 4, 238);
    			attr_dev(div0, "class", "content svelte-171gfvy");
    			add_location(div0, file, 9, 2, 156);
    			attr_dev(footer, "class", "footer svelte-171gfvy");
    			add_location(footer, file, 65, 2, 1609);
    			attr_dev(div1, "class", "wrapper svelte-171gfvy");
    			add_location(div1, file, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			mount_component(mainmenu, header, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, main);
    			append_dev(main, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t2);
    			append_dev(tr0, th1);
    			append_dev(tr0, t4);
    			append_dev(tr0, th2);
    			append_dev(tr0, t6);
    			append_dev(tr0, th3);
    			append_dev(tr0, t8);
    			append_dev(tr0, th4);
    			append_dev(tr0, t10);
    			append_dev(tr0, th5);
    			append_dev(tr0, t12);
    			append_dev(tr0, th6);
    			append_dev(tr0, t14);
    			append_dev(tr0, th7);
    			append_dev(table, t16);
    			append_dev(table, tr1);
    			append_dev(tr1, th8);
    			append_dev(tr1, t18);
    			append_dev(tr1, th9);
    			append_dev(tr1, t20);
    			append_dev(tr1, th10);
    			append_dev(tr1, t22);
    			append_dev(tr1, th11);
    			append_dev(tr1, t24);
    			append_dev(tr1, th12);
    			append_dev(tr1, t26);
    			append_dev(tr1, th13);
    			append_dev(table, t28);
    			append_dev(table, tr2);
    			append_dev(tr2, td0);
    			append_dev(tr2, t30);
    			append_dev(tr2, td1);
    			append_dev(tr2, t32);
    			append_dev(tr2, td2);
    			append_dev(tr2, t34);
    			append_dev(tr2, td3);
    			append_dev(tr2, t36);
    			append_dev(tr2, td4);
    			append_dev(tr2, t38);
    			append_dev(tr2, td5);
    			append_dev(tr2, t40);
    			append_dev(tr2, td6);
    			append_dev(tr2, t42);
    			append_dev(tr2, td7);
    			append_dev(tr2, t44);
    			append_dev(tr2, td8);
    			append_dev(tr2, t46);
    			append_dev(tr2, td9);
    			append_dev(tr2, t48);
    			append_dev(tr2, td10);
    			append_dev(tr2, t50);
    			append_dev(tr2, td11);
    			append_dev(table, t52);
    			append_dev(table, tr3);
    			append_dev(tr3, td12);
    			append_dev(tr3, t54);
    			append_dev(tr3, td13);
    			append_dev(tr3, t56);
    			append_dev(tr3, td14);
    			append_dev(tr3, t58);
    			append_dev(tr3, td15);
    			append_dev(tr3, t60);
    			append_dev(tr3, td16);
    			append_dev(tr3, t62);
    			append_dev(tr3, td17);
    			append_dev(tr3, t64);
    			append_dev(tr3, td18);
    			append_dev(tr3, t66);
    			append_dev(tr3, td19);
    			append_dev(tr3, t68);
    			append_dev(tr3, td20);
    			append_dev(tr3, t70);
    			append_dev(tr3, td21);
    			append_dev(tr3, t72);
    			append_dev(tr3, td22);
    			append_dev(tr3, t74);
    			append_dev(tr3, td23);
    			append_dev(div1, t76);
    			append_dev(div1, footer);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mainmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mainmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(mainmenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MainMenu });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
