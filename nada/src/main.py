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

    # correct letter, right index: put positive codepoint at index
    # else: 0 for "no local match"
    local_match = [(g == c).if_else(c, Integer(0)) for g, c in zip(guess, correct, strict=True)]

    # correct letter, wrong index: put 1 at index so the sum is non-0
    # else: 0 for "no global match"
    global_match = [sum([
        (g == c2).if_else(
            Integer(1),
            Integer(0),
        ) for c2 in cs
    ]) for g, cs in zip(guess, [correct] * NUM_LETTERS, strict=True)]

    outputs = [
        # +codepoint if there is a local match, or
        (loc == Integer(0)).if_else(
            # -codepoint if there are >0 global matches (non-0 sum), or
            (glo == Integer(0)).if_else(
                # 0 for no match whatsoever
                Integer(0),
                g * Integer(-1),
            ),
            loc,
        ) for loc, glo, g in zip(local_match, global_match, guess, strict=True)
    ]

    # return the output to the player
    return [Output(o, "guess_result_" + str(i), player) for i, o in enumerate(outputs, 1)]
