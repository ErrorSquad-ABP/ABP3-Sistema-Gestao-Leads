/**
 * Predicate over a domain candidate with composable rules (diagram: interface Specification).
 * Concrete specs typically extend {@link AbstractSpecification} to inherit and/or/not.
 */
interface Specification<T> {
	isSatisfiedBy(candidate: T): boolean;
	and(other: Specification<T>): Specification<T>;
	or(other: Specification<T>): Specification<T>;
	not(): Specification<T>;
}

abstract class AbstractSpecification<T> implements Specification<T> {
	abstract isSatisfiedBy(candidate: T): boolean;

	and(other: Specification<T>): Specification<T> {
		return new AndSpecification(this, other);
	}

	or(other: Specification<T>): Specification<T> {
		return new OrSpecification(this, other);
	}

	not(): Specification<T> {
		return new NotSpecification(this);
	}
}

class AndSpecification<T> extends AbstractSpecification<T> {
	constructor(
		private readonly left: Specification<T>,
		private readonly right: Specification<T>,
	) {
		super();
	}

	isSatisfiedBy(candidate: T): boolean {
		return (
			this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
		);
	}
}

class OrSpecification<T> extends AbstractSpecification<T> {
	constructor(
		private readonly left: Specification<T>,
		private readonly right: Specification<T>,
	) {
		super();
	}

	isSatisfiedBy(candidate: T): boolean {
		return (
			this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
		);
	}
}

class NotSpecification<T> extends AbstractSpecification<T> {
	constructor(private readonly inner: Specification<T>) {
		super();
	}

	isSatisfiedBy(candidate: T): boolean {
		return !this.inner.isSatisfiedBy(candidate);
	}
}

export type { Specification };
export { AbstractSpecification };
