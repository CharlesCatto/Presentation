// src/helpers/__mocks__/api.ts
export default {
	get: jest.fn(),
	post: jest.fn(),
	create: jest.fn(() => ({
		get: jest.fn(),
		post: jest.fn(),
	})),
};
