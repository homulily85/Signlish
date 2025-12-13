"use client"

import * as React from "react"
import {ArrowLeft, Book, Play, Search} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import type {DictionaryItem} from "@/types/type.ts";

export default function SignLanguageDictionary() {
  const [selectedWord, setSelectedWord] = React.useState<DictionaryItem| null>(null)
  const [popularWords, setPopularWords] = React.useState<DictionaryItem[]>([])
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [dictionary, setDictionary] = React.useState<DictionaryItem[]>([])
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [searchOpen])

  React.useEffect(() => {
    fetch("http://localhost:8000/dictionary").then((res)=>{
      res.json().then((data)=>{
        setDictionary([...data])
        setPopularWords(data.slice(5,25))
      })
    })
  }, [])

  const filteredWords = dictionary.filter((word) => word.word.toLowerCase().includes(searchValue.toLowerCase()))

  const handleWordSelect = (word: DictionaryItem) => {
    setSelectedWord(word)
    setSearchOpen(false)
    setSearchValue("")
  }

  const handleBack = () => {
    setSelectedWord(null)
  }

  // Search & Discovery View
  if (!selectedWord) {
    return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <header className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-primary text-primary-foreground rounded-2xl p-3">
                  <Book className="h-8 w-8"/>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-balance text-foreground">Sign Language
                  Dictionary</h1>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                Learn and discover sign language words!
              </p>
            </header>

            {/* Search Bar */}
            <div className="mb-12 flex justify-center">
              <Button
                  variant="outline"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search for sign language words"
                  className="w-full max-w-2xl justify-start text-left font-normal h-14 text-base md:text-lg shadow-md hover:shadow-lg transition-shadow bg-card"
              >
                <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground"/>
                <span className="text-muted-foreground">Search for a word...</span>
              </Button>
            </div>

            {searchOpen && (
                <>
                  {/* Backdrop overlay with blur */}
                  <div
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in"
                      onClick={() => setSearchOpen(false)}
                      aria-hidden="true"
                  />

                  {/* Centered floating search command */}
                  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[20vh] pointer-events-none">
                    <div className="w-full max-w-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
                      <Command className="rounded-lg border shadow-2xl bg-popover">
                        <CommandInput
                            ref={searchInputRef}
                            placeholder="Type to search..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                            aria-label="Search input for words"
                        />
                        <CommandList className="max-h-[400px]">
                          <CommandEmpty>No words found.</CommandEmpty>
                          <CommandGroup heading="Words">
                            {filteredWords.map((word) => (
                                <CommandItem
                                    key={word.id}
                                    value={word.word}
                                    onSelect={() => handleWordSelect(word)}
                                    className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <img
                                        src={"/placeholder.svg"}
                                        alt={`${word.word} sign`}
                                        className="w-12 h-12 rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                      <p className="font-semibold">{word.word}</p>
                                      <p className="text-sm text-muted-foreground truncate">{word.definition}</p>
                                    </div>
                                  </div>
                                </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  </div>
                </>
            )}

            {/* Popular Words Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular Words</h2>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {popularWords.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularWords.map((word) => (
                    <Card
                        key={word.id}
                        className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                        onClick={() => handleWordSelect(word)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleWordSelect(word)
                          }
                        }}
                        aria-label={`Learn the sign for ${word.word}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          {/* Video Thumbnail */}
                          <div
                              className="relative sm:w-48 h-40 sm:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                                src={"/placeholder.svg"}
                                alt={`${word.word} sign language demonstration`}
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-12 w-12 text-white drop-shadow-lg"/>
                            </div>
                            <Badge
                                className="absolute top-2 right-2 bg-primary text-primary-foreground"
                                aria-label={`${word.category} category`}
                            >
                              {word.category}
                            </Badge>
                          </div>

                          {/* Word Info */}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-2 text-foreground">{word.word}</h3>
                            <p className="text-muted-foreground line-clamp-2 text-pretty">{word.definition}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
    )
  }

  // Word Detail View
  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={handleBack} className="mb-6 text-base" aria-label="Back to dictionary">
            <ArrowLeft className="mr-2 h-5 w-5"/>
            Back to Dictionary
          </Button>

          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-4xl md:text-5xl font-bold mb-2">{selectedWord.word}</CardTitle>
                  <Badge variant="secondary" className="text-base">
                    {selectedWord.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>

          <CardContent className="p-6 md:p-8">
            {/* Main Video */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Play className="h-5 w-5 text-primary" />
                Video Demonstration
              </h2>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted shadow-md">
                <img
                  src={selectedWord.source || "/placeholder.svg"}
                  alt={`How to sign ${selectedWord.word}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button size="lg" className="rounded-full h-16 w-16 p-0" aria-label="Play video">
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>

              <Separator className="my-8"/>

              {/* Definition */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-foreground">What does it mean?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">{selectedWord.definition}</p>
              </div>

              <Separator className="my-8"/>

              {/* Instructions */}
              <div>
                <h2 className="text-xl font-semibold mb-3 text-foreground">How to sign it</h2>
                <Card className="bg-muted border-border">
                  <CardContent className="p-6">
                    <ol className="space-y-3">
                      {selectedWord.instruction.split(". ").map((step, index) => (
                          <li key={index} className="flex gap-3 text-base leading-relaxed">
                        <span
                            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </span>
                            <span className="flex-1 pt-0.5 text-pretty text-foreground">
                          {step.trim()}
                              {index < selectedWord.instruction.split(". ").length - 1 ? "." : ""}
                        </span>
                          </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
