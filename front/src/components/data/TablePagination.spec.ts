import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react"

import {
	TablePagination,
	buildPageSizeOptions,
	buildPaginationItems,
} from "./TablePagination"

type ElementProps = {
	readonly children?: ReactNode
	readonly [key: string]: unknown
}

function isElementWithProps(
	node: ReactNode
): node is ReactElement<ElementProps> {
	return isValidElement<ElementProps>(node)
}

function collectElements(
	node: ReactNode,
	predicate: (element: ReactElement<ElementProps>) => boolean
): ReactElement<ElementProps>[] {
	const elements: ReactElement<ElementProps>[] = []

	function visit(current: ReactNode): void {
		for (const child of Children.toArray(current)) {
			if (!isElementWithProps(child)) {
				continue
			}

			if (predicate(child)) {
				elements.push(child)
			}

			visit(child.props.children)
		}
	}

	visit(node)
	return elements
}

function textContent(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node)
	}

	if (!isElementWithProps(node)) {
		return Children.toArray(node).map(textContent).join("")
	}

	return textContent(node.props.children)
}

function renderTablePagination(
	props: Partial<Parameters<typeof TablePagination>[0]> = {}
): ReactNode {
	return TablePagination({
		onPageChange: () => undefined,
		page: 2,
		pageSize: 10,
		pageSizeOptions: [5, 10, 20],
		totalItems: 42,
		totalPages: 5,
		...props,
	})
}

function findByAriaLabel(
	tree: ReactNode,
	label: string
): ReactElement<ElementProps> {
	const element = collectElements(
		tree,
		(item) => item.props["aria-label"] === label
	).at(0)
	assert.ok(element, `Expected element with aria-label "${label}"`)
	return element
}

function findPageButton(
	tree: ReactNode,
	page: number
): ReactElement<ElementProps> {
	const element = collectElements(
		tree,
		(item) =>
			item.props.children === page && typeof item.props.onClick === "function"
	).at(0)
	assert.ok(element, `Expected page button ${page}`)
	return element
}

function findSelect(tree: ReactNode): ReactElement<ElementProps> {
	const element = collectElements(tree, (item) => item.type === "select").at(0)
	assert.ok(element, "Expected page size select")
	return element
}

function click(element: ReactElement<ElementProps>): void {
	const onClick = element.props.onClick
	if (typeof onClick !== "function") {
		assert.fail("Expected clickable element")
	}

	onClick()
}

function changeSelect(
	element: ReactElement<ElementProps>,
	value: string
): void {
	const onChange = element.props.onChange
	if (typeof onChange !== "function") {
		assert.fail("Expected changeable select element")
	}

	onChange({ target: { value } })
}

describe("buildPaginationItems", () => {
	it("returns a safe first page when totalPages is zero", () => {
		assert.deepEqual(buildPaginationItems(1, 0), [1])
	})

	it("returns a safe first page when totalPages is invalid", () => {
		assert.deepEqual(buildPaginationItems(1, Number.NaN), [1])
		assert.deepEqual(buildPaginationItems(1, Number.POSITIVE_INFINITY), [1])
		assert.deepEqual(buildPaginationItems(1, -3), [1])
	})

	it("returns all pages when totalPages fits without ellipses", () => {
		assert.deepEqual(buildPaginationItems(3, 5), [1, 2, 3, 4, 5])
		assert.deepEqual(buildPaginationItems(5, 6), [1, 2, 3, 4, 5, 6])
		assert.deepEqual(buildPaginationItems(6, 7), [1, 2, 3, 4, 5, 6, 7])
	})

	it("truncates decimal pages before building the range", () => {
		assert.deepEqual(buildPaginationItems(6.8, 10.9), [
			1,
			"ellipsis-start",
			5,
			6,
			7,
			"ellipsis-end",
			10,
		])
	})

	it("keeps the first window visible near the beginning", () => {
		assert.deepEqual(buildPaginationItems(1, 10), [
			1,
			2,
			3,
			4,
			"ellipsis-end",
			10,
		])
		assert.deepEqual(buildPaginationItems(4, 10), [
			1,
			2,
			3,
			4,
			"ellipsis-end",
			10,
		])
	})

	it("shows both ellipses in the middle range", () => {
		assert.deepEqual(buildPaginationItems(6, 10), [
			1,
			"ellipsis-start",
			5,
			6,
			7,
			"ellipsis-end",
			10,
		])
	})

	it("keeps boundary pages stable when ellipses are useful", () => {
		assert.deepEqual(buildPaginationItems(4, 8), [
			1,
			2,
			3,
			4,
			"ellipsis-end",
			8,
		])
		assert.deepEqual(buildPaginationItems(6, 8), [
			1,
			"ellipsis-start",
			5,
			6,
			7,
			8,
		])
	})

	it("keeps the last window visible near the end", () => {
		assert.deepEqual(buildPaginationItems(8, 10), [
			1,
			"ellipsis-start",
			7,
			8,
			9,
			10,
		])
		assert.deepEqual(buildPaginationItems(10, 10), [
			1,
			"ellipsis-start",
			7,
			8,
			9,
			10,
		])
	})

	it("clamps out-of-range current pages", () => {
		assert.deepEqual(buildPaginationItems(12, 10), [
			1,
			"ellipsis-start",
			7,
			8,
			9,
			10,
		])
		assert.deepEqual(buildPaginationItems(0, 10), [
			1,
			2,
			3,
			4,
			"ellipsis-end",
			10,
		])
	})
})

describe("buildPageSizeOptions", () => {
	it("deduplicates, includes the current page size, and sorts ascending", () => {
		assert.deepEqual(buildPageSizeOptions([20, 5, 10, 10], 15), [5, 10, 15, 20])
	})

	it("ignores invalid options without mutating the input array", () => {
		const options = [20, Number.NaN, -5, 10] as const

		assert.deepEqual(buildPageSizeOptions(options, 10), [10, 20])
		assert.deepEqual(options, [20, Number.NaN, -5, 10])
	})
})

describe("TablePagination", () => {
	it("renders accessible labels, active page, and enabled navigation", () => {
		const tree = renderTablePagination({ page: 2, totalPages: 4 })
		const previousButton = findByAriaLabel(tree, "Página anterior")
		const nextButton = findByAriaLabel(tree, "Próxima página")
		const currentPage = collectElements(
			tree,
			(item) => item.props["aria-current"] === "page"
		).at(0)

		assert.ok(findByAriaLabel(tree, "Paginação da tabela"))
		assert.equal(previousButton.props.disabled, false)
		assert.equal(nextButton.props.disabled, false)
		assert.equal(currentPage?.props.children, 2)
	})

	it("disables controls while loading", () => {
		const tree = renderTablePagination({
			isLoading: true,
			onPageSizeChange: () => undefined,
		})
		const pageButtons = collectElements(
			tree,
			(item) => typeof item.props.onClick === "function"
		)

		assert.equal(findByAriaLabel(tree, "Página anterior").props.disabled, true)
		assert.equal(findByAriaLabel(tree, "Próxima página").props.disabled, true)
		assert.equal(findSelect(tree).props.disabled, true)
		assert.ok(pageButtons.every((button) => button.props.disabled === true))
	})

	it("calls navigation callbacks for previous, next, and a page button", () => {
		const pageChanges: number[] = []
		const tree = renderTablePagination({
			onPageChange: (page) => pageChanges.push(page),
			page: 2,
			totalPages: 8,
		})

		click(findByAriaLabel(tree, "Página anterior"))
		click(findByAriaLabel(tree, "Próxima página"))
		click(findPageButton(tree, 4))

		assert.deepEqual(pageChanges, [1, 3, 4])
	})

	it("renders ellipses as non interactive separators", () => {
		const tree = renderTablePagination({ page: 5, totalPages: 10 })
		const ellipses = collectElements(
			tree,
			(item) => item.props.children === "..."
		)

		assert.equal(ellipses.length, 2)
		assert.ok(
			ellipses.every((ellipsis) => ellipsis.props["aria-hidden"] === "true")
		)
		assert.ok(
			ellipses.every((ellipsis) => ellipsis.props.onClick === undefined)
		)
	})

	it("sorts page size options and calls the page size callback", () => {
		const pageSizeChanges: number[] = []
		const tree = renderTablePagination({
			onPageSizeChange: (pageSize) => pageSizeChanges.push(pageSize),
			pageSize: 15,
			pageSizeOptions: [20, 5, 10, 10],
		})
		const select = findSelect(tree)
		const optionValues = collectElements(
			select,
			(item) => item.type === "option"
		).map((option) => option.props.value)

		changeSelect(select, "20")

		assert.deepEqual(optionValues, [5, 10, 15, 20])
		assert.deepEqual(pageSizeChanges, [20])
	})

	it("handles zero items and one safe page without unsafe ranges", () => {
		const tree = renderTablePagination({
			itemLabel: "leads",
			page: 99,
			totalItems: 0,
			totalPages: 0,
		})
		const summary = collectElements(tree, (item) =>
			textContent(item).includes("Mostrando 0 a 0 de 0 leads")
		).at(0)

		assert.ok(summary)
		assert.equal(findByAriaLabel(tree, "Página anterior").props.disabled, true)
		assert.equal(findByAriaLabel(tree, "Próxima página").props.disabled, true)
		assert.equal(findPageButton(tree, 1).props["aria-current"], "page")
	})

	it("renders short ranges without ellipses", () => {
		const tree = renderTablePagination({ page: 5, totalPages: 7 })
		const pages = collectElements(
			tree,
			(item) => typeof item.props.children === "number"
		).map((pageButton) => pageButton.props.children)
		const ellipses = collectElements(
			tree,
			(item) => item.props.children === "..."
		)

		assert.deepEqual(pages, [1, 2, 3, 4, 5, 6, 7])
		assert.equal(ellipses.length, 0)
	})

	it("clamps active page and keeps navigation safe", () => {
		const tree = renderTablePagination({ page: 99, totalPages: 3 })
		const currentPage = collectElements(
			tree,
			(item) => item.props["aria-current"] === "page"
		).at(0)

		assert.equal(currentPage?.props.children, 3)
		assert.equal(findByAriaLabel(tree, "Página anterior").props.disabled, false)
		assert.equal(findByAriaLabel(tree, "Próxima página").props.disabled, true)
	})
})
