from nada_dsl import *

# the words are always 5 letters long
NUM_LETTERS = 5

def nada_main():
    # the gamemaker sets the word of the day
    gamemaker = Party(name="Gamemaker")
    # the player attempts to guess the word of the day
    player = Party(name="Player")

    # have the gamemaker input 5 secret letters of the word of the day, indexes starting at 1
    correct = [SecretInteger(Input(name = "correct_" + str(i), party = gamemaker)) for i in range(1, NUM_LETTERS + 1)]
    # have the player input 5 secret letters of their guess of the word of the day, indexes starting at 1
    guess = [SecretInteger(Input(name = "guess_" + str(i), party = player)) for i in range(1, NUM_LETTERS + 1)]

    # for each letter from word of the day and player's guess
    # if the player's guessed letter is the correct letter: output the guessed letter at that index
    # otherwise: output 0 for "no match"
    output = [(g == c).if_else(g, Integer(0)) for g, c in zip(guess, correct)]

    # return the output to the player
    return [Output(o, "guess_result_" + str(i), player) for i, o in enumerate(output, 1)]
