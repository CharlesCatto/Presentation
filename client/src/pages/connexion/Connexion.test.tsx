// // // En haut du fichier
// // jest.mock("./Connexion.module.css", () => ({}));
// // jest.mock("../../helpers/api");
// // jest.mock("../../contexts/AuthContext", () => ({
// // 	useAuth: () => ({
// // 		handleLogin: jest.fn(),
// // 	}),
// // }));
// // jest.mock("../../services/toast", () => ({
// // 	errorToast: jest.fn(),
// // 	successToast: jest.fn(),
// // }));

// // import { render, screen, fireEvent } from "@testing-library/react";
// // import { MemoryRouter } from "react-router-dom";
// // import Connexion from "./Connexion";

// // describe("Tests du formulaire", () => {
// // 	const renderConnexion = () => {
// // 		return render(
// // 			<MemoryRouter>
// // 				<Connexion />
// // 			</MemoryRouter>,
// // 		);
// // 	};

// // 	test("1. Email invalide", () => {
// // 		renderConnexion();

// // 		fireEvent.change(screen.getByLabelText(/Email/i), {
// // 			target: { value: "email-invalide" },
// // 		});
// // 		fireEvent.click(screen.getByText(/Se connecter|S'inscrire/i));

// // 		expect(screen.getByText(/Format d'email incorrect/i)).toBeTruthy();
// // 	});

// // 	test("2. Mot de passe faible", () => {
// // 		renderConnexion();

// // 		fireEvent.click(screen.getByText(/S'inscrire/i));
// // 		fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
// // 			target: { value: "123" },
// // 		});
// // 		fireEvent.click(screen.getByText(/S'inscrire/i));

// // 		expect(screen.getByText(/Le mot de passe est trop faible/i)).toBeTruthy();
// // 	});

// // 	test("3. Formulaire valide", async () => {
// // 		renderConnexion();

// // 		fireEvent.click(screen.getByText(/S'inscrire/i));
// // 		fireEvent.change(screen.getByLabelText(/Email/i), {
// // 			target: { value: "test@example.com" },
// // 		});
// // 		fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
// // 			target: { value: "Motdepasse123!" },
// // 		});
// // 		fireEvent.change(screen.getByLabelText(/Confirmer/i), {
// // 			target: { value: "Motdepasse123!" },
// // 		});
// // 		fireEvent.click(screen.getByText(/S'inscrire/i));

// // 		expect(screen.queryByText(/erreur/i)).toBeNull();
// // 	});

// // 	test("4. Rejette les mots de passe sans caractère spécial", () => {
// // 		renderConnexion();
// // 		fireEvent.click(screen.getByText(/S'inscrire/i));
// // 		fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
// // 			target: { value: "Motdepasse123" },
// // 		});
// // 		fireEvent.click(screen.getByText(/S'inscrire/i));

// // 		expect(screen.getByText(/caractère spécial/i)).toBeTruthy();
// // 	});
// // });

// // En haut du fichier
// jest.mock("./Connexion.module.css", () => ({}));
// jest.mock("../../helpers/api");
// jest.mock("../../contexts/AuthContext", () => ({
// 	useAuth: () => ({
// 		handleLogin: jest.fn(),
// 		handleRegister: jest.fn(),
// 	}),
// }));
// jest.mock("../../services/toast", () => ({
// 	errorToast: jest.fn(),
// 	successToast: jest.fn(),
// }));

// import { render, screen, fireEvent } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Connexion from "./Connexion";

// describe("Tests du formulaire", () => {
// 	const renderConnexion = () => {
// 		return render(
// 			<MemoryRouter>
// 				<Connexion />
// 			</MemoryRouter>,
// 		);
// 	};

// 	test("1. Email invalide", () => {
// 		renderConnexion();

// 		// Remplir avec un email invalide
// 		fireEvent.change(screen.getByLabelText(/Email/i), {
// 			target: { value: "email-invalide" },
// 		});
// 		// Utilisez un sélecteur plus précis pour le bouton de connexion
// 		fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

// 		// Vérifier qu'un message d'erreur apparaît
// 		expect(screen.getByText(/Format d'email incorrect/i)).toBeInTheDocument();
// 	});

// 	test("2. Mot de passe faible", () => {
// 		renderConnexion();

// 		// Passer en mode inscription
// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		// Utilisez l'ID exact du champ mot de passe
// 		const passwordInput = screen.getByTestId("register-password");
// 		fireEvent.change(passwordInput, {
// 			target: { value: "123" },
// 		});
// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		expect(
// 			screen.getByText(/Le mot de passe est trop faible/i),
// 		).toBeInTheDocument();
// 	});

// 	test("3. Formulaire valide", () => {
// 		renderConnexion();

// 		// Passer en mode inscription
// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		// Remplir correctement
// 		fireEvent.change(screen.getByLabelText(/Email/i), {
// 			target: { value: "test@example.com" },
// 		});

// 		const passwordInput = screen.getByTestId("register-password");
// 		const confirmInput = screen.getByTestId("register-confirm-password");

// 		fireEvent.change(passwordInput, {
// 			target: { value: "Motdepasse123!" },
// 		});
// 		fireEvent.change(confirmInput, {
// 			target: { value: "Motdepasse123!" },
// 		});

// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		// Vérifier qu'aucune erreur n'est affichée
// 		expect(screen.queryByText(/erreur/i)).toBeNull();
// 	});

// 	test("4. Rejette les mots de passe sans caractère spécial", () => {
// 		renderConnexion();
// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		const passwordInput = screen.getByTestId("register-password");
// 		fireEvent.change(passwordInput, {
// 			target: { value: "Motdepasse123" },
// 		});
// 		fireEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

// 		expect(screen.getByText(/caractère spécial/i)).toBeInTheDocument();
// 	});
// });
// En haut du fichier
jest.mock("./Connexion.module.css", () => ({}));
jest.mock("../../helpers/api");
jest.mock("../../contexts/AuthContext", () => ({
	useAuth: () => ({
		handleLogin: jest.fn(),
		handleRegister: jest.fn(),
	}),
}));
jest.mock("../../services/toast", () => ({
	errorToast: jest.fn(),
	successToast: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => jest.fn(),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Connexion from "./Connexion";

describe("Tests du formulaire", () => {
	const renderConnexion = () => {
		return render(
			<MemoryRouter>
				<Connexion />
			</MemoryRouter>,
		);
	};

	test("1. Email invalide", () => {
		renderConnexion();

		// Remplir avec un email invalide
		fireEvent.change(screen.getByTestId("login-email"), {
			target: { value: "email-invalide" },
		});
		fireEvent.click(screen.getByTestId("login-submit"));

		// Vérifier qu'un message d'erreur apparaît
		expect(screen.getByText(/Format d'email incorrect/i)).toBeTruthy();
	});

	test("2. Mot de passe faible", () => {
		renderConnexion();

		// Passer en mode inscription
		fireEvent.click(screen.getByTestId("toggle-to-register"));

		// Remplir avec un mot de passe faible
		fireEvent.change(screen.getByTestId("register-password"), {
			target: { value: "123" },
		});
		fireEvent.click(screen.getByTestId("register-submit"));

		// Vérifier le message
		expect(screen.getByText(/Le mot de passe est trop faible/i)).toBeTruthy();
	});

	test("3. Formulaire valide", () => {
		renderConnexion();

		// Passer en mode inscription
		fireEvent.click(screen.getByTestId("toggle-to-register"));

		// Remplir correctement
		fireEvent.change(screen.getByTestId("register-email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByTestId("register-password"), {
			target: { value: "Motdepasse123!" },
		});
		fireEvent.change(screen.getByTestId("register-confirm-password"), {
			target: { value: "Motdepasse123!" },
		});
		fireEvent.click(screen.getByTestId("register-submit"));

		// Vérifier qu'aucune erreur n'est affichée
		expect(screen.queryByText(/erreur/i)).toBeNull();
	});

	test("4. Rejette les mots de passe sans caractère spécial", () => {
		renderConnexion();
		fireEvent.click(screen.getByTestId("toggle-to-register"));

		fireEvent.change(screen.getByTestId("register-password"), {
			target: { value: "Motdepasse123" }, // Sans caractère spécial
		});
		fireEvent.click(screen.getByTestId("register-submit"));

		expect(screen.getByText(/caractère spécial/i)).toBeTruthy();
	});
});
