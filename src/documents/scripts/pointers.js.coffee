# =====================================
## Pointers

extendr = require('extendr')

class Pointer
	config: null

	constructor: (item, args...) ->
		@config ?= {}

		type = if item.length? then 'collection' else 'model'

		if type is 'model'
			@config.handler ?= ({$el, value}) ->
				value ?= ''
				if $el.is(':input')
					$el.val(value)
				else
					$el.text(value)

			@setConfig(
				type: type
				item: item
				attributes: args
			)
		else

			@config.handler ?= (opts) =>
				{model, event, collection} = opts
				switch event
					when 'add'
						controller = new @config.Controller(item: model)

						controller.$el
							.data('controller', controller)
							.data('model', model)

						controller
							.render()
							.appendTo(@config.element)

					when 'remove'
						$el = @getModelElement(model)
						if $el.data('controller')?.destroy()
							$el.remove()

					when 'reset'
						@config.element.children().each ->
							$el = $(@)
							if $el.data('controller')?.destroy()
								$el.remove()

						for model in collection.models
							@addHandler(model, collection, opts)

						###
						cidsDesired = collection.pluck('cid')
						cidsActual = []

						@config.element.children().each (el) ->
							$el = $(el)

							cid = $el.data('model').cid
							cidsActual.push(cid)

							if cid in cidsDesired
								$el.data('controller').render()
							else
								$el.data('controller').destroy()
								$el.remove()

						for model in collection.models
							if model.cid in cidsActual
								# ignore, we already updated it
							else
								# add it, it is new
								@addHandler(model, collection, opts)
						###

			@setConfig(
				type: type
				item: item
				Controller: args[0]
			)

		setTimeout(@bind, 0)

		@

	bind: =>
		@config.element.data('pointer')?.destroy()
		@config.element.data('pointer', @)

		@unbind()
		if @config.type is 'model'
			@config.item.on('change:'+attribute, @changeAttributeHandler)  for attribute in @config.attributes  if @config.attributes
			@changeAttributeHandler(@config.model, @config.item.get(@config.attributes[0]) , {})
		else
			@config.item
				.on('add',    @addHandler)
				.on('remove', @removeHandler)
				.on('reset',  @resetHandler)
			@resetHandler(@config.item.models, @config.item, {})
		@

	unbind: =>
		@config.item.off('change:'+attribute, @changeAttributeHandler)  for attribute in @config.attributes  if @config.attributes
		@config.item
			.off('add',    @addHandler)
			.off('remove', @removeHandler)
			.off('reset',  @resetHandler)
		@

	destroy: (opts) =>
		@unbind()
		if @config.type is 'collection'
			@config.element.children().each ->
				$el = $(@)
				if $el.data('controller')?.destroy()
					$el.remove()
		#@config.element.remove()
		@

	setConfig: (config={}) ->
		for own key,value of config
			@config[key] = value
		@


	addHandler: (model, collection, opts) =>
		@callUserHandler extendr.extend(opts, {event:'add', model, collection})
	removeHandler: (model, collection, opts) =>
		@callUserHandler extendr.extend(opts, {event:'remove', model, collection})
	resetHandler: (collection, opts) =>
		@callUserHandler extendr.extend(opts, {event:'reset', collection})
	changeAttributeHandler: (model, value, opts) =>
		@callUserHandler extendr.extend(opts, {event:'change', model, value})

	callUserHandler: (opts) =>
		opts.$el = @config.element
		opts[@config.type] = @config.item
		opts.item = @config.item
		@config.handler(opts)
		return true

	getModelElement: (model) =>
		return @config.element.find(".model-#{model.cid}:first") ? null
	getModelController: (model) =>
		return @getModelElement(model)?.data('controller') ? null


	using: (handler) ->
		@setConfig({handler})
		@

	to: (element) ->
		@setConfig({element})
		@

# Exports
module.exports = {Pointer}